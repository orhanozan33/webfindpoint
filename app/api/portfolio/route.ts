import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/database'
import { Portfolio } from '@/entities/Portfolio'

/**
 * Public API route to fetch active portfolio items
 * No authentication required - for public website display
 */
export async function GET() {
  try {
    const dataSource = await initializeDatabase()
    const portfolioRepository = dataSource.getRepository(Portfolio)
    
    // Fetch only active portfolio items, ordered by sortOrder
    const portfolioItems = await portfolioRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    })

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
  } catch (error) {
    console.error('Error fetching portfolio items:', error)
    return NextResponse.json(
      { error: 'Portfolio items could not be fetched' },
      { status: 500 }
    )
  }
}
