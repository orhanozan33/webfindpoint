import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/database'
import { Portfolio } from '@/entities/Portfolio'

/**
 * Public API route to fetch active portfolio items
 * No authentication required - for public website display
 */
export async function GET() {
  try {
    // Skip during build
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json([])
    }

    const dataSource = await initializeDatabase()
    const portfolioRepository = dataSource.getRepository(Portfolio)
    
    // Fetch only active portfolio items, ordered by sortOrder
    // If no active items, try to fetch all items (for debugging)
    let portfolioItems = await portfolioRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    })

    // If no active items found, check if there are any items at all (for debugging)
    if (portfolioItems.length === 0 && process.env.NODE_ENV === 'development') {
      const allItems = await portfolioRepository.find({
        order: { sortOrder: 'ASC', createdAt: 'DESC' },
        take: 5, // Just check first 5
      })
      if (allItems.length > 0) {
        console.warn(`⚠️  Found ${allItems.length} portfolio items but none are active (isActive: true)`)
      }
    }

    // Serialize to plain objects
    const serialized = portfolioItems.map((item) => ({
      id: item.id,
      title: item.title,
      titleFr: item.titleFr,
      titleTr: item.titleTr,
      description: item.description,
      descriptionFr: item.descriptionFr,
      descriptionTr: item.descriptionTr,
      category: item.category,
      technologies: item.technologies || [],
      image: item.image,
      projectUrl: item.projectUrl,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }))

    return NextResponse.json(serialized)
  } catch (error: any) {
    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching portfolio items:', error)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    // Return empty array instead of error to prevent UI crashes
    // This allows the page to render even if database is unavailable
    return NextResponse.json([])
  }
}
