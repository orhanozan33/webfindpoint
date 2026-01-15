import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/database'
import { User } from '@/entities/User'
import { generateToken } from '@/lib/auth/jwt'

// Ensure this route is handled dynamically
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET endpoint - Returns API information
 */
export async function GET() {
  return NextResponse.json({
    message: 'Admin Login API',
    endpoint: '/api/auth/login',
    method: 'POST',
    description: 'Use POST method to login',
    loginPage: '/admin/login',
    requiredFields: {
      email: 'string',
      password: 'string',
    },
    example: {
      url: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        email: 'your-email@example.com',
        password: 'your-password',
      },
    },
  })
}

export async function POST(request: NextRequest) {
  // Log immediately when POST handler is called
  console.log('=== POST /api/auth/login - Handler called ===')
  console.log('Request method:', request.method)
  console.log('Request URL:', request.url)
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('VERCEL:', process.env.VERCEL)
  
  try {
    
    // Parse request body with better error handling
    let body
    try {
      body = await request.json()
      console.log('Request body received:', { email: body?.email ? '***' : 'missing', hasPassword: !!body?.password })
    } catch (parseError: any) {
      console.error('Body parsing error:', parseError)
      return NextResponse.json(
        { 
          error: 'Invalid request body. Please send JSON with email and password.',
          details: process.env.NODE_ENV === 'development' ? parseError?.message : undefined
        },
        { status: 400 }
      )
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a JSON object' },
        { status: 400 }
      )
    }

    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('Attempting login for email:', email)

    // Initialize database with error handling
    let dataSource
    try {
      console.log('Initializing database connection...')
      dataSource = await initializeDatabase()
      console.log('Database connection successful')
    } catch (dbError: any) {
      // Log error in both development and production for debugging
      console.error('❌ Database initialization error:', dbError)
      console.error('Error message:', dbError?.message)
      console.error('Error stack:', dbError?.stack)
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please check your database configuration.',
          details: process.env.NODE_ENV === 'development' ? dbError?.message : undefined
        },
        { status: 500 }
      )
    }

    const userRepository = dataSource.getRepository(User)

    // Find user (check both active and inactive for debugging)
    let user
    try {
      const normalizedEmail = email.toLowerCase().trim()
      console.log('Searching for user with email (normalized):', normalizedEmail)
      
      // Try to find user with normalized email first
      user = await userRepository.findOne({
        where: { email: normalizedEmail },
      })
      
      // If not found, try with original email (case-sensitive)
      if (!user) {
        console.log('User not found with normalized email, trying original:', email.trim())
        user = await userRepository.findOne({
          where: { email: email.trim() },
        })
      }
      
      console.log('User found:', user ? { id: user.id, email: user.email, isActive: user.isActive, role: user.role } : 'NOT FOUND')
    } catch (queryError: any) {
      console.error('❌ User query error:', queryError)
      console.error('Error message:', queryError?.message)
      return NextResponse.json(
        { 
          error: 'Database query failed',
          details: process.env.NODE_ENV === 'development' ? queryError?.message : undefined
        },
        { status: 500 }
      )
    }

    if (!user) {
      console.log('❌ User not found for email:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      console.log('❌ User account is inactive:', user.email)
      return NextResponse.json(
        { error: 'Account is inactive. Please contact administrator.' },
        { status: 401 }
      )
    }

    // Compare password
    let isValidPassword = false
    try {
      if (!user.password) {
        console.error('❌ User password is missing in database')
        return NextResponse.json(
          { error: 'Password verification failed - user password not found' },
          { status: 500 }
        )
      }
      console.log('Comparing password...')
      console.log('Password from request length:', password?.length || 0)
      console.log('Stored password hash length:', user.password?.length || 0)
      console.log('Stored password hash preview:', user.password?.substring(0, 20) + '...')
      console.log('Stored password starts with $2b$ (bcrypt):', user.password?.startsWith('$2b$') || user.password?.startsWith('$2a$'))
      isValidPassword = await user.comparePassword(password)
      console.log('Password comparison result:', isValidPassword ? '✅ VALID' : '❌ INVALID')
    } catch (pwdError: any) {
      console.error('❌ Password comparison error:', pwdError)
      console.error('Error message:', pwdError?.message)
      console.error('Error stack:', pwdError?.stack)
      return NextResponse.json(
        { 
          error: 'Password verification failed',
          details: process.env.NODE_ENV === 'development' ? pwdError?.message : undefined
        },
        { status: 500 }
      )
    }

    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', user.email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create session token
    let token
    try {
      // Ensure userId is a string
      const userId = String(user.id)
      const userEmail = String(user.email || '')
      const userRole = String(user.role || 'admin')
      const agencyId = user.agencyId ? String(user.agencyId) : undefined

      console.log('Creating token with payload:', { userId, userEmail, userRole, agencyId })

      token = generateToken({
        userId,
        email: userEmail,
        role: userRole,
        agencyId,
      })
      console.log('✅ Token generated successfully')
    } catch (tokenError: any) {
      console.error('❌ Token generation error:', tokenError)
      console.error('Error message:', tokenError?.message)
      console.error('Error stack:', tokenError?.stack)
      return NextResponse.json(
        { 
          error: 'Failed to create session token',
          details: process.env.NODE_ENV === 'development' ? tokenError?.message : undefined
        },
        { status: 500 }
      )
    }

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: String(user.id),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })

    // Set cookie on response
    try {
      response.cookies.set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
      console.log('✅ Cookie set successfully')
      console.log('=== Login successful ===')
    } catch (cookieError: any) {
      console.error('❌ Cookie setting error:', cookieError)
      // Continue anyway - token is in response
    }

    return response
  } catch (error: any) {
    // Always log errors for debugging in production
    console.error('❌❌❌ UNEXPECTED LOGIN ERROR ❌❌❌')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    console.error('Full error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}