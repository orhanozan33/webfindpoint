// JWT functions - server-side only
// Using require to avoid bundling issues with crypto
/* eslint-disable */

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
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
  const jwt = require('jsonwebtoken')
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

export function verifyToken(token: string): JWTPayload | null {
  // This function should only be called server-side
  if (typeof window !== 'undefined') {
    return null
  }
  try {
    const jwt = require('jsonwebtoken')
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}