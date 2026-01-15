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

    // Initialize database with error handling
    let dataSource
    try {
      dataSource = await initializeDatabase()
    } catch (dbError: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Database initialization error:', dbError)
      }
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
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact administrator.' },
        { status: 401 }
      )
    }

    // Compare password
    let isValidPassword = false
    try {
      isValidPassword = await user.comparePassword(password)
    } catch (pwdError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Password comparison error:', pwdError)
      }
      return NextResponse.json(
        { error: 'Password verification failed' },
        { status: 500 }
      )
    }

    if (!isValidPassword) {
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
    } catch (sessionError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Session creation error:', sessionError)
      }
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
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', error)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}