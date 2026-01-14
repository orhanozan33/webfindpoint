import { initializeDatabase } from '@/lib/db/database'
import { Invoice } from '@/entities/Invoice'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { getSession } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/roles'
import { redirect } from 'next/navigation'

// Dynamic import to prevent useContext errors
const InvoicesList = dynamic(() => import('@/components/admin/InvoicesList').then((mod) => ({ default: mod.InvoicesList })), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
      <p className="text-neutral-500">Yükleniyor...</p>
    </div>
  ),
})

export default async function InvoicesPage() {
  const session = await getSession()
  if (!session) {
    redirect('/admin/login')
  }

  let invoices: any[] = []
  
  try {
    const dataSource = await initializeDatabase()
    const invoiceRepository = dataSource.getRepository(Invoice)
    const invoiceEntities = await invoiceRepository.find({
      relations: ['client', 'project'],
      order: { createdAt: 'DESC' },
    })
    
    // Serialize entities to plain objects
    invoices = invoiceEntities.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientId: invoice.clientId,
      client: invoice.client ? {
        id: invoice.client.id,
        name: invoice.client.name,
        companyName: invoice.client.companyName,
        email: invoice.client.email,
      } : null,
      projectId: invoice.projectId,
      project: invoice.project ? {
        id: invoice.project.id,
        name: invoice.project.name,
      } : null,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      currency: invoice.currency,
      status: invoice.status,
      notes: invoice.notes,
      pdfPath: invoice.pdfPath,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    }))
  } catch (error) {
    console.error('Error fetching invoices:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Faturalar</h1>
          <p className="text-neutral-600">Faturaları yönetin ve oluşturun</p>
        </div>
        <Link
          href="/admin/invoices/new"
          className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Fatura Oluştur
        </Link>
      </div>

      <InvoicesList invoices={invoices} />
    </div>
  )
}