import { cookies } from 'next/headers'
import { verifyToken, JWTPayload } from './jwt'

export interface SessionPayload extends JWTPayload {
  agencyId?: string
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value

    if (process.env.NODE_ENV === 'development') {
      console.log('getSession - Cookie found:', !!token)
      if (token) {
        console.log('getSession - Token length:', token.length)
        console.log('getSession - Token preview:', token.substring(0, 50) + '...')
      }
    }

    if (!token) {
      return null
    }

    // Try to decode token without verification to see what's inside (server-side only)
    if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
      try {
        // Use require to prevent bundling - only works server-side
        const jwt = require('jsonwebtoken')
        const decoded = jwt.decode(token) as any
        if (decoded) {
          console.log('getSession - Token decoded (without verification):', {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            iat: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : null,
            exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null,
          })
        }
      } catch (decodeError) {
        console.error('getSession - Failed to decode token:', decodeError)
      }
    }

    const verified = verifyToken(token) as SessionPayload | null
    
    if (process.env.NODE_ENV === 'development') {
      console.log('getSession - Token verified:', !!verified)
      if (verified) {
        console.log('getSession - Verified payload:', { userId: verified.userId, email: verified.email, role: verified.role })
      } else if (token) {
        console.log('getSession - Token verification failed (cookie will be cleared on next request)')
        // Note: Cannot delete cookies in layout, will be handled by middleware or route handler
      }
    }

    return verified
  } catch (error) {
    console.error('getSession error:', error)
    return null
  }
}

export async function setSession(payload: SessionPayload): Promise<void> {
  const cookieStore = await cookies()
  const { generateToken } = await import('./jwt')
  const token = generateToken(payload)

  cookieStore.set('admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('admin-token')
}