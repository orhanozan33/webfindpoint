import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/database'
import { Payment } from '@/entities/Payment'
import { getAgencyContext } from '@/lib/multi-tenant/scope'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const dataSource = await initializeDatabase()
    const paymentRepository = dataSource.getRepository(Payment)
    const context = await getAgencyContext(session)
    
    const payments = await paymentRepository.find({
      where: context.agencyId ? { agencyId: context.agencyId } : {},
      relations: ['project', 'project.client'],
      order: { createdAt: 'DESC' },
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
      return NextResponse.json(
        { error: 'Ödemeler getirilemedi' },
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
    const { projectId, amount, currency, status, paymentDate, notes } = body

    if (!projectId || !amount) {
      return NextResponse.json(
        { error: 'Proje ve tutar gereklidir' },
        { status: 400 }
      )
    }

    const dataSource = await initializeDatabase()
    const paymentRepository = dataSource.getRepository(Payment)
    const context = await getAgencyContext(session)

    // Get project to get agencyId
    const projectRepository = dataSource.getRepository(require('@/entities/Project').Project)
    const project = await projectRepository.findOne({ 
      where: { id: projectId },
      select: ['id', 'agencyId'],
    })
    
    if (!project) {
      return NextResponse.json(
        { error: 'Proje bulunamadı' },
        { status: 404 }
      )
    }

    // Use project's agencyId if available, otherwise use context agencyId
    let finalAgencyId = project.agencyId || context.agencyId

    // For super admins without agencyId, use first active agency
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

    // For other roles, agencyId is required
    if (!finalAgencyId && context.role !== 'super_admin') {
      console.error('Agency context error:', { context, session, project })
      return NextResponse.json(
        { error: 'Agency bağlamı gereklidir. Lütfen yöneticinizle iletişime geçin.' },
        { status: 400 }
      )
    }

    // Verify project belongs to same agency (unless super admin)
    if (project.agencyId && project.agencyId !== finalAgencyId && context.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Yetkisiz: Proje farklı bir agency\'ye ait' },
        { status: 403 }
      )
    }

    const payment = paymentRepository.create({
      agencyId: finalAgencyId!,
      projectId,
      amount: parseFloat(amount),
      currency: currency || 'CAD',
      status: status || 'unpaid',
      paymentDate: paymentDate ? new Date(paymentDate) : undefined,
      notes,
    })

    await paymentRepository.save(payment)

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
      return NextResponse.json(
        { error: 'Ödeme oluşturulamadı' },
        { status: 500 }
      )
  }
}