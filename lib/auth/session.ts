import { cookies } from 'next/headers'
import { verifyToken, JWTPayload } from './jwt'

export interface SessionPayload extends JWTPayload {
  agencyId?: string
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin-token')?.value

  if (!token) {
    return null
  }

  return verifyToken(token) as SessionPayload | null
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