import { NextRequest, NextResponse } from 'next/server'
import { authorize } from '@/lib/auth/authorize'
import { initializeDatabase } from '@/lib/db/database'
import { Invoice } from '@/entities/Invoice'
import { generateInvoicePDF } from '@/lib/invoices/generator'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request, { requiredPermission: 'canManageInvoices' })
  if (!auth.authorized) {
    return auth.response!
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

    // Generate PDF
    const pdfPath = await generateInvoicePDF(invoice)

    // Update invoice with PDF path
    invoice.pdfPath = pdfPath
    await invoiceRepository.save(invoice)

    return NextResponse.json({ success: true, pdfPath })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}