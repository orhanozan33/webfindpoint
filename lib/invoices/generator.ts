import { Invoice } from '@/entities/Invoice'
import { InvoiceItem } from '@/entities/InvoiceItem'
import PDFDocument from 'pdfkit'
import { join } from 'path'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'

const INVOICE_DIR = join(process.cwd(), 'public', 'invoices')

export async function generateInvoicePDF(invoice: Invoice): Promise<string> {
  // Ensure invoice directory exists
  if (!existsSync(INVOICE_DIR)) {
    await mkdir(INVOICE_DIR, { recursive: true })
  }

  const doc = new PDFDocument({ margin: 50, size: 'LETTER' })
  const filename = `invoice-${invoice.invoiceNumber}.pdf`
  const filepath = join(INVOICE_DIR, filename)

  // Create write stream
  const stream = require('fs').createWriteStream(filepath)
  doc.pipe(stream)

  // Header
  doc.fontSize(24).text('INVOICE', { align: 'right' })
  doc.fontSize(12).text(`Invoice #: ${invoice.invoiceNumber}`, { align: 'right' })
  doc.moveDown()

  // Company Info
  doc.fontSize(14).text('FindPoint', { align: 'left' })
  doc.fontSize(10).text('Digital Agency', { align: 'left' })
  doc.fontSize(10).text('Canada', { align: 'left' })
  doc.moveDown(2)

  // Client Info
  doc.fontSize(12).text('Bill To:', { continued: false })
  doc.fontSize(11).text(invoice.client.name, { indent: 20 })
  if (invoice.client.companyName) {
    doc.fontSize(11).text(invoice.client.companyName, { indent: 20 })
  }
  doc.fontSize(11).text(invoice.client.email, { indent: 20 })
  doc.moveDown()

  // Invoice Details
  doc.fontSize(11).text(`Issue Date: ${formatDate(invoice.issueDate)}`, { align: 'right' })
  doc.fontSize(11).text(`Due Date: ${formatDate(invoice.dueDate)}`, { align: 'right' })
  doc.moveDown(2)

  // Items Table
  const tableTop = doc.y
  const itemHeight = 30

  // Table Header
  doc.fontSize(10).font('Helvetica-Bold')
  doc.text('Description', 50, tableTop)
  doc.text('Qty', 350, tableTop)
  doc.text('Unit Price', 400, tableTop, { align: 'right' })
  doc.text('Total', 500, tableTop, { align: 'right' })

  // Draw line
  doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke()

  // Table Items
  let y = tableTop + 30
  doc.font('Helvetica')
  invoice.items.forEach((item) => {
    doc.fontSize(10).text(item.description, 50, y, { width: 280 })
    doc.text(item.quantity.toString(), 350, y)
    doc.text(
      `${invoice.currency} ${Number(item.unitPrice).toFixed(2)}`,
      400,
      y,
      { align: 'right' }
    )
    doc.text(
      `${invoice.currency} ${Number(item.total).toFixed(2)}`,
      500,
      y,
      { align: 'right' }
    )
    y += itemHeight
  })

  // Totals
  y += 10
  doc.moveTo(400, y).lineTo(550, y).stroke()
  y += 10

  doc.fontSize(11).text('Subtotal:', 400, y, { align: 'right' })
  doc.text(
    `${invoice.currency} ${Number(invoice.subtotal).toFixed(2)}`,
    500,
    y,
    { align: 'right' }
  )
  y += 20

  if (invoice.tax > 0) {
    doc.text('Tax:', 400, y, { align: 'right' })
    doc.text(
      `${invoice.currency} ${Number(invoice.tax).toFixed(2)}`,
      500,
      y,
      { align: 'right' }
    )
    y += 20
  }

  doc.fontSize(12).font('Helvetica-Bold')
  doc.text('Total:', 400, y, { align: 'right' })
  doc.text(
    `${invoice.currency} ${Number(invoice.total).toFixed(2)}`,
    500,
    y,
    { align: 'right' }
  )

  // Notes
  if (invoice.notes) {
    y += 40
    doc.fontSize(10).font('Helvetica')
    doc.text('Notes:', 50, y)
    doc.text(invoice.notes, 50, y + 15, { width: 500 })
  }

  // Footer
  doc.fontSize(8).text(
    'Thank you for your business!',
    50,
    doc.page.height - 50,
    { align: 'center' }
  )

  doc.end()

  // Wait for stream to finish
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve)
    stream.on('error', reject)
  })

  return `/invoices/${filename}`
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}