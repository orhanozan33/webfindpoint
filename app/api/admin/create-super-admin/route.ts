import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/database'
import { User } from '@/entities/User'
import * as bcrypt from 'bcryptjs'

// This endpoint should be protected in production
// For now, it's a one-time setup endpoint
export async function POST(request: NextRequest) {
  try {
    // Simple protection - check for a secret key
    const authHeader = request.headers.get('authorization')
    const secret = process.env.SUPER_ADMIN_SECRET || 'setup-secret-change-in-production'

    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const dataSource = await initializeDatabase()
    const userRepository = dataSource.getRepository(User)

    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: { email },
    })

    if (existingUser) {
      // Update existing user
      existingUser.password = await bcrypt.hash(password, 10)
      existingUser.role = 'super_admin'
      existingUser.isActive = true
      existingUser.agencyId = undefined
      if (name) existingUser.name = name
      await userRepository.save(existingUser)

      return NextResponse.json({
        success: true,
        message: 'Super admin updated',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
        },
      })
    }

    // Create new super admin
    const hashedPassword = await bcrypt.hash(password, 10)
    const superAdmin = userRepository.create({
      email,
      password: hashedPassword,
      name: name || 'Super Admin',
      role: 'super_admin',
      isActive: true,
      agencyId: undefined, // Super admin has no agency
    })

    await userRepository.save(superAdmin)

    return NextResponse.json({
      success: true,
      message: 'Super admin created',
      user: {
        id: superAdmin.id,
        email: superAdmin.email,
        name: superAdmin.name,
        role: superAdmin.role,
      },
    })
  } catch (error) {
    console.error('Error creating super admin:', error)
    return NextResponse.json(
      {
        error: 'Failed to create super admin',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}