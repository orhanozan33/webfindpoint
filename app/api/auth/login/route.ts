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
      // Log error in both development and production for debugging
      console.error('Database initialization error:', dbError)
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
      user = await userRepository.findOne({
        where: { email },
      })
    } catch (queryError: any) {
      console.error('User query error:', queryError)
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
      if (!user.password) {
        console.error('User password is missing')
        return NextResponse.json(
          { error: 'Password verification failed - user password not found' },
          { status: 500 }
        )
      }
      isValidPassword = await user.comparePassword(password)
    } catch (pwdError: any) {
      console.error('Password comparison error:', pwdError)
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
    } catch (sessionError: any) {
      console.error('Session creation error:', sessionError)
      console.error('Error message:', sessionError?.message)
      console.error('Error stack:', sessionError?.stack)
      return NextResponse.json(
        { 
          error: 'Failed to create session',
          details: process.env.NODE_ENV === 'development' ? sessionError?.message : undefined
        },
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
    // Always log errors for debugging in production
    console.error('Login error:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}