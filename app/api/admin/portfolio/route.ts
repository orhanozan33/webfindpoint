import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/database'
import { Portfolio } from '@/entities/Portfolio'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const dataSource = await initializeDatabase()
    const portfolioRepository = dataSource.getRepository(Portfolio)
    const portfolioItems = await portfolioRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    })

    return NextResponse.json(portfolioItems)
  } catch (error) {
    console.error('Error fetching portfolio items:', error)
    return NextResponse.json(
      { error: 'Portföy öğeleri getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, titleFr, titleTr, description, descriptionFr, descriptionTr, category, technologies, image, projectUrl, isActive, sortOrder } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Başlık ve açıklama gereklidir' },
        { status: 400 }
      )
    }

    const dataSource = await initializeDatabase()
    const portfolioRepository = dataSource.getRepository(Portfolio)

    const portfolio = portfolioRepository.create({
      title,
      titleFr: titleFr || title,
      titleTr: titleTr || title,
      description,
      descriptionFr: descriptionFr || description,
      descriptionTr: descriptionTr || description,
      category,
      technologies: Array.isArray(technologies) ? technologies : (technologies ? [technologies] : []),
      image,
      projectUrl,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0,
    })

    await portfolioRepository.save(portfolio)

    return NextResponse.json(portfolio, { status: 201 })
  } catch (error) {
    console.error('Error creating portfolio item:', error)
    return NextResponse.json(
      { error: 'Portföy öğesi oluşturulamadı' },
      { status: 500 }
    )
  }
}
