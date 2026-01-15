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

    // Create hosting service using insert to avoid loading relations and cyclic dependency
    const insertData: any = {
      agencyId: finalAgencyId,
      provider,
      startDate: new Date(startDate),
      autoRenew: autoRenew || false,
      currency: currency || 'CAD',
    }
    
    if (plan) {
      insertData.plan = plan
    }
    if (endDate) {
      insertData.endDate = new Date(endDate)
    }
    if (monthlyCost) {
      insertData.monthlyCost = parseFloat(monthlyCost)
    }
    if (notes) {
      insertData.notes = notes
    }
    if (projectId) {
      insertData.projectId = projectId
    }
    
    const insertResult = await hostingRepository.insert(insertData)

    const hostingId = insertResult.identifiers[0].id

    // Fetch the created hosting service without relations to avoid cyclic dependency
    const hosting = await hostingRepository.findOne({
      where: { id: hostingId },
      select: ['id', 'agencyId', 'provider', 'plan', 'startDate', 'endDate', 'autoRenew', 'monthlyCost', 'currency', 'notes', 'projectId', 'createdAt', 'updatedAt'],
    })

    if (!hosting) {
      throw new Error('Hosting service was created but could not be retrieved')
    }

    return NextResponse.json(hosting, { status: 201 })
  } catch (error: any) {
    console.error('Error creating hosting service:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      constraint: error?.constraint,
      detail: error?.detail,
      table: error?.table,
      stack: error?.stack?.substring(0, 500)
    })
    
    // Check for specific database constraint errors
    if (error?.code === '23503' || error?.constraint) {
      return NextResponse.json(
        { 
          error: 'Hosting hizmeti oluşturulamadı: Geçersiz proje veya bağlantı hatası',
          details: process.env.NODE_ENV === 'development' ? `Constraint: ${error.constraint}, Table: ${error.table}` : undefined
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Hosting hizmeti oluşturulamadı',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}
