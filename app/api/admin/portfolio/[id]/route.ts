import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/database'
import { Portfolio } from '@/entities/Portfolio'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const dataSource = await initializeDatabase()
    const portfolioRepository = dataSource.getRepository(Portfolio)
    const portfolio = await portfolioRepository.findOne({ where: { id } })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portföy öğesi bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error('Error fetching portfolio item:', error)
    return NextResponse.json(
      { error: 'Portföy öğesi getirilemedi' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
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
    const portfolio = await portfolioRepository.findOne({ where: { id } })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portföy öğesi bulunamadı' }, { status: 404 })
    }

    portfolio.title = title
    portfolio.titleFr = titleFr || title
    portfolio.titleTr = titleTr || title
    portfolio.description = description
    portfolio.descriptionFr = descriptionFr || description
    portfolio.descriptionTr = descriptionTr || description
    portfolio.category = category
    portfolio.technologies = Array.isArray(technologies) ? technologies : (technologies ? [technologies] : [])
    portfolio.image = image
    portfolio.projectUrl = projectUrl
    portfolio.isActive = isActive !== undefined ? isActive : true
    portfolio.sortOrder = sortOrder || 0

    await portfolioRepository.save(portfolio)

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error('Error updating portfolio item:', error)
    return NextResponse.json(
      { error: 'Portföy öğesi güncellenemedi' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const dataSource = await initializeDatabase()
    const portfolioRepository = dataSource.getRepository(Portfolio)
    const portfolio = await portfolioRepository.findOne({ where: { id } })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portföy öğesi bulunamadı' }, { status: 404 })
    }

    await portfolioRepository.remove(portfolio)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting portfolio item:', error)
    return NextResponse.json(
      { error: 'Portföy öğesi silinemedi' },
      { status: 500 }
    )
  }
}
