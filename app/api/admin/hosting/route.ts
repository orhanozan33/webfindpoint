import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/database'
import { HostingService } from '@/entities/HostingService'
import { getAgencyContext } from '@/lib/multi-tenant/scope'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const dataSource = await initializeDatabase()
    const hostingRepository = dataSource.getRepository(HostingService)
    const context = await getAgencyContext(session)
    
    const hostingServices = await hostingRepository.find({
      where: context.agencyId ? { agencyId: context.agencyId } : {},
      relations: ['project', 'project.client'],
      order: { startDate: 'DESC' },
    })

    return NextResponse.json(hostingServices)
  } catch (error) {
    console.error('Error fetching hosting services:', error)
      return NextResponse.json(
        { error: 'Hosting hizmetleri getirilemedi' },
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
    const { provider, plan, startDate, endDate, autoRenew, monthlyCost, currency, notes, projectId } = body

    if (!provider || !startDate) {
      return NextResponse.json(
        { error: 'Sağlayıcı ve başlangıç tarihi gereklidir' },
        { status: 400 }
      )
    }

    const dataSource = await initializeDatabase()
    const hostingRepository = dataSource.getRepository(HostingService)
    const context = await getAgencyContext(session)

    // Super admins can create hosting without agencyId (will use first agency as fallback)
    // For other roles, agencyId is required
    if (!context.agencyId && context.role !== 'super_admin') {
      console.error('Agency context error:', { context, session })
      return NextResponse.json(
        { error: 'Agency bağlamı gereklidir. Lütfen yöneticinizle iletişime geçin.' },
        { status: 400 }
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

    // If projectId is provided, use project's agencyId
    if (projectId) {
      const Project = require('@/entities/Project').Project
      const projectRepository = dataSource.getRepository(Project)
      const project = await projectRepository.findOne({
        where: { id: projectId },
        select: ['id', 'agencyId'],
      })
      if (project && project.agencyId) {
        finalAgencyId = project.agencyId
      }
    }

    if (!finalAgencyId) {
      return NextResponse.json(
        { error: 'Agency bağlamı belirlenemedi' },
        { status: 400 }
      )
    }

    const hosting = hostingRepository.create({
      agencyId: finalAgencyId,
      provider,
      plan,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      autoRenew: autoRenew || false,
      monthlyCost: monthlyCost ? parseFloat(monthlyCost) : undefined,
      currency: currency || 'CAD',
      notes,
      projectId: projectId || undefined,
    })

    await hostingRepository.save(hosting)

    return NextResponse.json(hosting, { status: 201 })
  } catch (error) {
    console.error('Error creating hosting service:', error)
      return NextResponse.json(
        { error: 'Hosting hizmeti oluşturulamadı' },
        { status: 500 }
      )
  }
}
