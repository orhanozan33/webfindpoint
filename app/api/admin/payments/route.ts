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
    console.log('[PAYMENT CREATE] Request body:', { ...body, amount: body.amount })
    const { projectId, amount, currency, status, paymentDate, notes } = body

    if (!projectId) {
      console.log('[PAYMENT CREATE] Validation failed: No projectId')
      return NextResponse.json(
        { error: 'Proje seçilmelidir' },
        { status: 400 }
      )
    }

    if (!amount || amount === '' || amount === null || amount === undefined) {
      console.log('[PAYMENT CREATE] Validation failed: No amount')
      return NextResponse.json(
        { error: 'Tutar gereklidir' },
        { status: 400 }
      )
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      console.log('[PAYMENT CREATE] Validation failed: Invalid amount', { amount, parsedAmount })
      return NextResponse.json(
        { error: 'Geçerli bir tutar giriniz (0\'dan büyük olmalıdır)' },
        { status: 400 }
      )
    }

    console.log('[PAYMENT CREATE] Initializing database...')
    const dataSource = await initializeDatabase()
    const paymentRepository = dataSource.getRepository(Payment)
    const context = await getAgencyContext(session)
    console.log('[PAYMENT CREATE] Context:', { agencyId: context.agencyId, role: context.role })

    // Get project to get agencyId
    console.log('[PAYMENT CREATE] Fetching project:', projectId)
    const projectRepository = dataSource.getRepository(require('@/entities/Project').Project)
    const project = await projectRepository.findOne({ 
      where: { id: projectId },
      select: ['id', 'agencyId'],
    })
    
    if (!project) {
      console.error('[PAYMENT CREATE] Project not found:', projectId)
      return NextResponse.json(
        { error: 'Proje bulunamadı' },
        { status: 404 }
      )
    }
    console.log('[PAYMENT CREATE] Project found:', { id: project.id, agencyId: project.agencyId })

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

    // Validate finalAgencyId before creating payment
    if (!finalAgencyId) {
      console.error('[PAYMENT CREATE] No agencyId available', { context, project })
      return NextResponse.json(
        { error: 'Agency bağlamı belirlenemedi. Lütfen yöneticinizle iletişime geçin.' },
        { status: 400 }
      )
    }

    console.log('[PAYMENT CREATE] Creating payment with:', {
      agencyId: finalAgencyId,
      projectId,
      amount: parsedAmount,
      currency: currency || 'CAD',
      status: status || 'unpaid',
      paymentDate: paymentDate ? new Date(paymentDate) : undefined,
    })

    const payment = paymentRepository.create({
      agencyId: finalAgencyId,
      projectId,
      amount: parsedAmount,
      currency: currency || 'CAD',
      status: status || 'unpaid',
      paymentDate: paymentDate ? new Date(paymentDate) : undefined,
      notes: notes || undefined,
    })

    console.log('[PAYMENT CREATE] Saving payment...')
    await paymentRepository.save(payment)
    console.log('[PAYMENT CREATE] Payment saved successfully:', payment.id)

    return NextResponse.json(payment, { status: 201 })
  } catch (error: any) {
    console.error('Error creating payment:', error)
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
          error: 'Ödeme oluşturulamadı: Geçersiz proje veya bağlantı hatası',
          details: process.env.NODE_ENV === 'development' ? `Constraint: ${error.constraint}, Table: ${error.table}` : undefined
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Ödeme oluşturulamadı',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}