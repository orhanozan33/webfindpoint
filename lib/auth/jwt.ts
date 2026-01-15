// JWT functions - server-side only
// Using require to avoid bundling issues with crypto
/* eslint-disable */

// Get JWT_SECRET from environment - ensure it's always the same
function getJwtSecret(): string {
  const secret = (process.env.JWT_SECRET || 'your-secret-key-change-in-production').trim()
  if (!secret || secret === 'your-secret-key-change-in-production') {
    console.error('⚠️ WARNING: Using default JWT_SECRET! This is insecure for production!')
  }
  return secret
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  agencyId?: string
}

export function generateToken(payload: JWTPayload): string {
  // This function should only be called server-side
  if (typeof window !== 'undefined') {
    throw new Error('generateToken can only be called server-side')
  }
  // Use dynamic require to prevent bundling
  const jwt = require('jsonwebtoken')
  const secret = getJwtSecret()
  
  if (process.env.NODE_ENV === 'development') {
    console.log('generateToken - JWT_SECRET exists:', !!secret)
    console.log('generateToken - JWT_SECRET length:', secret?.length || 0)
    console.log('generateToken - JWT_SECRET preview:', secret?.substring(0, 20) + '...')
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

export function verifyToken(token: string): JWTPayload | null {
  // This function should only be called server-side
  if (typeof window !== 'undefined') {
    return null
  }
  try {
    // Use dynamic require to prevent bundling
    const jwt = require('jsonwebtoken')
    const secret = getJwtSecret()
    const decoded = jwt.verify(token, secret) as JWTPayload
    
    if (process.env.NODE_ENV === 'development') {
      console.log('verifyToken - Successfully verified token for user:', decoded.email)
    }
    
    return decoded
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      const secret = getJwtSecret()
      console.error('verifyToken - Verification failed:', error?.message || error)
      console.error('verifyToken - Error name:', error?.name)
      console.error('verifyToken - JWT_SECRET exists:', !!secret)
      console.error('verifyToken - JWT_SECRET length:', secret?.length || 0)
      console.error('verifyToken - JWT_SECRET preview:', secret?.substring(0, 20) + '...')
      console.error('verifyToken - Token preview:', token?.substring(0, 50) + '...')
    }
    return null
  }
}