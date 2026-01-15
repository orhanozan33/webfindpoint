import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/database'
import { User } from '@/entities/User'
import * as bcrypt from 'bcryptjs'

/**
 * One-time setup endpoint to:
 * 1. Initialize database and create all tables
 * 2. Create super admin user
 * 
 * This endpoint should be called once after first deployment
 * No authentication required for initial setup
 */
export async function POST(request: NextRequest) {
  try {
    // Skip during build
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ 
        message: 'Setup skipped during build',
        success: false 
      })
    }

    const results: any = {
      database: { success: false, message: '' },
      tables: { success: false, tables: [] as string[], count: 0 },
      superAdmin: { success: false, message: '', user: null as any },
    }

    // Step 1: Initialize database
    try {
      const dataSource = await initializeDatabase()
      
      if (!dataSource.isInitialized) {
        await dataSource.initialize()
      }

      results.database = {
        success: true,
        message: 'Database initialized successfully',
      }

      // Step 2: Get table list
      const entityMetadatas = dataSource.entityMetadatas
      const tableNames = entityMetadatas.map(metadata => metadata.tableName)
      
      results.tables = {
        success: true,
        tables: tableNames,
        count: tableNames.length,
      }

      // Step 3: Create super admin user
      const userRepository = dataSource.getRepository(User)
      const email = 'orhanozan33@gmail.com'
      const password = '33333333'
      const name = 'Super Admin'

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
        existingUser.name = name
        await userRepository.save(existingUser)

        results.superAdmin = {
          success: true,
          message: 'Super admin updated',
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            role: existingUser.role,
          },
        }
      } else {
        // Create new super admin
        const hashedPassword = await bcrypt.hash(password, 10)
        const superAdmin = userRepository.create({
          email,
          password: hashedPassword,
          name,
          role: 'super_admin',
          isActive: true,
          agencyId: undefined,
        })

        await userRepository.save(superAdmin)

        results.superAdmin = {
          success: true,
          message: 'Super admin created',
          user: {
            id: superAdmin.id,
            email: superAdmin.email,
            name: superAdmin.name,
            role: superAdmin.role,
          },
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Setup completed successfully',
        results,
      })
    } catch (dbError: any) {
      console.error('Database setup error:', dbError)
      results.database = {
        success: false,
        message: dbError?.message || 'Database initialization failed',
      }
      
      return NextResponse.json(
        {
          success: false,
          error: 'Setup failed',
          results,
          details: process.env.NODE_ENV === 'development' ? dbError?.message : undefined,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Setup failed',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check setup status
 */
export async function GET() {
  try {
    const dataSource = await initializeDatabase()
    
    if (!dataSource.isInitialized) {
      return NextResponse.json({
        initialized: false,
        message: 'Database not initialized',
      })
    }

    const entityMetadatas = dataSource.entityMetadatas
    const tableNames = entityMetadatas.map(metadata => metadata.tableName)

    // Check if super admin exists
    const userRepository = dataSource.getRepository(User)
    const superAdmin = await userRepository.findOne({
      where: { email: 'orhanozan33@gmail.com' },
    })

    return NextResponse.json({
      initialized: true,
      tables: tableNames,
      tableCount: tableNames.length,
      superAdminExists: !!superAdmin,
      superAdmin: superAdmin ? {
        email: superAdmin.email,
        role: superAdmin.role,
        isActive: superAdmin.isActive,
      } : null,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        initialized: false,
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
