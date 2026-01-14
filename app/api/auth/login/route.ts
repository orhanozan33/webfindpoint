import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/database'
import { User } from '@/entities/User'
import { setSession } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('Login attempt for email:', email)

    // Initialize database with error handling
    let dataSource
    try {
      dataSource = await initializeDatabase()
      console.log('Database initialized successfully')
    } catch (dbError: any) {
      console.error('Database initialization error:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed. Please check your database configuration.' },
        { status: 500 }
      )
    }

    const userRepository = dataSource.getRepository(User)

    // Find user (check both active and inactive for debugging)
    const user = await userRepository.findOne({
      where: { email },
    })

    if (!user) {
      console.log('User not found:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      console.log('User is inactive:', email)
      return NextResponse.json(
        { error: 'Account is inactive. Please contact administrator.' },
        { status: 401 }
      )
    }

    console.log('User found:', user.email, 'Role:', user.role)

    // Compare password
    let isValidPassword = false
    try {
      isValidPassword = await user.comparePassword(password)
      console.log('Password comparison result:', isValidPassword)
    } catch (pwdError) {
      console.error('Password comparison error:', pwdError)
      return NextResponse.json(
        { error: 'Password verification failed' },
        { status: 500 }
      )
    }

    if (!isValidPassword) {
      console.log('Invalid password for user:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Set session
    try {
      await setSession({
        userId: user.id,
        email: user.email,
        role: user.role,
        agencyId: user.agencyId,
      })
      console.log('Session created successfully for user:', user.email)
    } catch (sessionError) {
      console.error('Session creation error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error: any) {
    console.error('Login error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}