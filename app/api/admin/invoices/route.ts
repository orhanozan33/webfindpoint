import { NextRequest, NextResponse } from 'next/server'
import { authorize } from '@/lib/auth/authorize'
import { initializeDatabase } from '@/lib/db/database'
import { Invoice } from '@/entities/Invoice'
import { InvoiceItem } from '@/entities/InvoiceItem'
import { generateInvoicePDF } from '@/lib/invoices/generator'

export async function GET(request: NextRequest) {
  const auth = await authorize(request, { requiredPermission: 'canManageInvoices' })
  if (!auth.authorized) {
    return auth.response!
  }

  const dataSource = await initializeDatabase()
  const invoiceRepository = dataSource.getRepository(Invoice)
  const invoices = await invoiceRepository.find({
    relations: ['client', 'project', 'items'],
    order: { createdAt: 'DESC' },
  })

  return NextResponse.json(invoices)
}

export async function POST(request: NextRequest) {
  const auth = await authorize(request, { requiredPermission: 'canManageInvoices' })
  if (!auth.authorized) {
    return auth.response!
  }

  try {
    const body = await request.json()
    const {
      clientId,
      projectId,
      issueDate,
      dueDate,
      items,
      tax,
      currency,
      notes,
    } = body

    if (!clientId || !issueDate || !dueDate || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Client, dates, and items are required' },
        { status: 400 }
      )
    }

    const dataSource = await initializeDatabase()
    const invoiceRepository = dataSource.getRepository(Invoice)
    const itemRepository = dataSource.getRepository(InvoiceItem)

    // Generate invoice number
    const count = await invoiceRepository.count()
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + Number(item.unitPrice) * Number(item.quantity),
      0
    )
    const taxAmount = tax ? Number(tax) : 0
    const total = subtotal + taxAmount

    // Create invoice
    const invoice = invoiceRepository.create({
      invoiceNumber,
      clientId,
      projectId,
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate),
      subtotal,
      tax: taxAmount,
      total,
      currency: currency || 'CAD',
      status: 'draft',
      notes,
    })

    await invoiceRepository.save(invoice)

    // Create invoice items
    const invoiceItems = items.map((item: any) =>
      itemRepository.create({
        invoiceId: invoice.id,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.unitPrice) * Number(item.quantity),
      })
    )

    await itemRepository.save(invoiceItems)

    // Reload with relations
    const savedInvoice = await invoiceRepository.findOne({
      where: { id: invoice.id },
      relations: ['client', 'project', 'items'],
    })

    return NextResponse.json(savedInvoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}