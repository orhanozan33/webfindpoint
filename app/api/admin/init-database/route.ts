import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/database'

/**
 * Initialize database and create tables
 * This endpoint should be called once after deployment to create all tables
 * No authentication required for initial setup
 */
export async function POST(request: NextRequest) {
  try {
    // Skip during build
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ 
        message: 'Database initialization skipped during build',
        success: false 
      })
    }

    const dataSource = await initializeDatabase()
    
    // Force synchronization to create tables
    if (!dataSource.isInitialized) {
      await dataSource.initialize()
    }

    // Get all entity metadata to verify tables exist
    const entityMetadatas = dataSource.entityMetadatas
    const tableNames = entityMetadatas.map(metadata => metadata.tableName)

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      tables: tableNames,
      count: tableNames.length,
    })
  } catch (error: any) {
    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Database initialization error:', error)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Database initialization failed',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check database status
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

    return NextResponse.json({
      initialized: true,
      tables: tableNames,
      count: tableNames.length,
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
