import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/database'
import { Payment } from '@/entities/Payment'

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
    const paymentRepository = dataSource.getRepository(Payment)
    const payment = await paymentRepository.findOne({
      where: { id },
      relations: ['project', 'project.client'],
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
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
    const { projectId, amount, currency, status, paymentDate, notes } = body

    if (!projectId || !amount) {
      return NextResponse.json(
        { error: 'Project and amount are required' },
        { status: 400 }
      )
    }

    const dataSource = await initializeDatabase()
    const paymentRepository = dataSource.getRepository(Payment)
    const payment = await paymentRepository.findOne({ where: { id } })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    payment.projectId = projectId
    payment.amount = parseFloat(amount)
    payment.currency = currency || 'CAD'
    payment.status = status || 'unpaid'
    payment.paymentDate = paymentDate ? new Date(paymentDate) : undefined
    payment.notes = notes

    await paymentRepository.save(payment)

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      { error: 'Failed to update payment' },
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
    const paymentRepository = dataSource.getRepository(Payment)
    const payment = await paymentRepository.findOne({ where: { id } })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    await paymentRepository.remove(payment)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    )
  }
}
