import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/database'
import { Project } from '@/entities/Project'
import { getAgencyContext } from '@/lib/multi-tenant/scope'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const dataSource = await initializeDatabase()
  const projectRepository = dataSource.getRepository(Project)
  const project = await projectRepository.findOne({
    where: { id },
    relations: ['client'],
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  return NextResponse.json(project)
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
    const { name, description, type, clientId, startDate, deliveryDate, status, price, currency } = body

    if (!name || !type || !clientId) {
      return NextResponse.json(
        { error: 'Name, type, and client are required' },
        { status: 400 }
      )
    }

    const dataSource = await initializeDatabase()
    const projectRepository = dataSource.getRepository(Project)
    const project = await projectRepository.findOne({ where: { id } })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    project.name = name
    project.description = description
    project.type = type
    project.clientId = clientId
    project.startDate = startDate ? new Date(startDate) : undefined
    project.deliveryDate = deliveryDate ? new Date(deliveryDate) : undefined
    project.status = status || 'planning'
    project.price = price ? parseFloat(price) : undefined
    project.currency = currency || 'CAD'

    await projectRepository.save(project)

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
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
    const projectRepository = dataSource.getRepository(Project)
    const context = await getAgencyContext(session)
    
    const project = await projectRepository.findOne({ 
      where: { id },
      select: ['id', 'agencyId'],
    })

    if (!project) {
      return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 })
    }

    // Verify agency access (unless super admin)
    if (context.role !== 'super_admin' && project.agencyId !== context.agencyId) {
      return NextResponse.json(
        { error: 'Bu projeyi silme yetkiniz yok' },
        { status: 403 }
      )
    }

    await projectRepository.remove(project)

    return NextResponse.json({ success: true, message: 'Proje başarıyla silindi' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Proje silinemedi' },
      { status: 500 }
    )
  }
}