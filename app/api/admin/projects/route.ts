import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/database'
import { Project } from '@/entities/Project'
import { getAgencyContext } from '@/lib/multi-tenant/scope'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const dataSource = await initializeDatabase()
    const projectRepository = dataSource.getRepository(Project)
    const context = await getAgencyContext(session)
    
    const projects = await projectRepository.find({
      where: context.agencyId ? { agencyId: context.agencyId } : {},
      relations: ['client'],
      order: { createdAt: 'DESC' },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
      return NextResponse.json(
        { error: 'Projeler getirilemedi' },
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
    const { name, description, type, clientId, startDate, deliveryDate, status, price, currency } = body

    if (!name || !type || !clientId) {
      return NextResponse.json(
        { error: 'Ad, tip ve müşteri gereklidir' },
        { status: 400 }
      )
    }

    const dataSource = await initializeDatabase()
    const projectRepository = dataSource.getRepository(Project)
    const context = await getAgencyContext(session)

    // Super admins can create projects without agencyId (will use first agency as fallback)
    // For other roles, agencyId is required
    if (!context.agencyId && context.role !== 'super_admin') {
      console.error('Agency context error:', { context, session })
      return NextResponse.json(
        { error: 'Agency bağlamı gereklidir. Lütfen yöneticinizle iletişime geçin.' },
        { status: 400 }
      )
    }

    // Get client to verify agencyId
    const clientRepository = dataSource.getRepository(require('@/entities/Client').Client)
    const client = await clientRepository.findOne({ 
      where: { id: clientId },
      select: ['id', 'agencyId'],
    })
    
    if (!client) {
      return NextResponse.json(
        { error: 'Müşteri bulunamadı' },
        { status: 404 }
      )
    }

    // For super admins without agencyId, use first active agency
    let finalAgencyId = context.agencyId
    if (!finalAgencyId && context.role === 'super_admin') {
      const Agency = require('@/entities/Agency').Agency
      const agencyRepository = dataSource.getRepository(Agency)
      const firstAgency = await agencyRepository.findOne({
        where: { isActive: true },
        select: ['id'],
        order: { createdAt: 'ASC' },
      })
      if (firstAgency) {
        finalAgencyId = firstAgency.id
      } else {
        return NextResponse.json(
          { error: 'Sistemde aktif bir agency bulunamadı. Lütfen önce bir agency oluşturun.' },
          { status: 400 }
        )
      }
    }

    // Use client's agencyId if available, otherwise use context agencyId
    if (client.agencyId) {
      finalAgencyId = client.agencyId
    }

    if (!finalAgencyId) {
      return NextResponse.json(
        { error: 'Agency bağlamı belirlenemedi' },
        { status: 400 }
      )
    }

    // Verify client belongs to same agency (unless super admin)
    if (client.agencyId && client.agencyId !== finalAgencyId && context.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Yetkisiz: Müşteri farklı bir agency\'ye ait' },
        { status: 403 }
      )
    }

    const project = projectRepository.create({
      agencyId: finalAgencyId,
      name,
      description,
      type,
      clientId,
      startDate: startDate ? new Date(startDate) : undefined,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
      status: status || 'planning',
      price: price ? parseFloat(price) : undefined,
      currency: currency || 'CAD',
    })

    await projectRepository.save(project)

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
      return NextResponse.json(
        { error: 'Proje oluşturulamadı' },
        { status: 500 }
      )
  }
}