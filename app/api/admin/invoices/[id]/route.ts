import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/database'
import { Invoice } from '@/entities/Invoice'
import { InvoiceItem } from '@/entities/InvoiceItem'

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
    const invoiceRepository = dataSource.getRepository(Invoice)
    const invoice = await invoiceRepository.findOne({
      where: { id },
      relations: ['client', 'project', 'items'],
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
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
    const { clientId, projectId, issueDate, dueDate, subtotal, tax, total, currency, status, notes, items } = body

    if (!clientId || !issueDate || !dueDate || !total) {
      return NextResponse.json(
        { error: 'Client, dates, and total are required' },
        { status: 400 }
      )
    }

    const dataSource = await initializeDatabase()
    const invoiceRepository = dataSource.getRepository(Invoice)
    const invoice = await invoiceRepository.findOne({ where: { id }, relations: ['items'] })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    invoice.clientId = clientId
    invoice.projectId = projectId || undefined
    invoice.issueDate = new Date(issueDate)
    invoice.dueDate = new Date(dueDate)
    invoice.subtotal = parseFloat(subtotal)
    invoice.tax = parseFloat(tax || 0)
    invoice.total = parseFloat(total)
    invoice.currency = currency || 'CAD'
    invoice.status = status || 'draft'
    invoice.notes = notes

    // Update items if provided
    if (items && Array.isArray(items)) {
      const invoiceItemRepository = dataSource.getRepository(InvoiceItem)
      // Delete existing items
      await invoiceItemRepository.delete({ invoiceId: id })
      // Create new items
      for (const item of items) {
        const invoiceItem = invoiceItemRepository.create({
          invoiceId: id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })
        await invoiceItemRepository.save(invoiceItem)
      }
    }

    await invoiceRepository.save(invoice)

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice' },
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
    
    // Use transaction to ensure all deletions succeed or fail together
    await dataSource.transaction(async (transactionalEntityManager) => {
      const invoiceRepository = transactionalEntityManager.getRepository(Invoice)
      const invoiceItemRepository = transactionalEntityManager.getRepository(InvoiceItem)
      
      // 1. Delete InvoiceItems first
      await invoiceItemRepository.delete({ invoiceId: id })
      
      // 2. Delete Invoice
      await invoiceRepository.delete({ id })
    })

    return NextResponse.json({ success: true, message: 'Fatura başarıyla silindi' })
  } catch (error: any) {
    console.error('Error deleting invoice:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack?.substring(0, 500)
    })
    return NextResponse.json(
      { 
        error: 'Fatura silinemedi',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
