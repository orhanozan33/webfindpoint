import { initializeDatabase } from '@/lib/db/database'
import { Client } from '@/entities/Client'
import { Project } from '@/entities/Project'
import { Agency } from '@/entities/Agency'
import dynamicImport from 'next/dynamic'
import { getSession } from '@/lib/auth/session'
import { getAgencyContext } from '@/lib/multi-tenant/scope'
import { redirect } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Dynamic import to prevent useContext errors
const InvoiceForm = dynamicImport(() => import('@/components/admin/InvoiceForm').then((mod) => ({ default: mod.InvoiceForm })), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
      <p className="text-neutral-500">Yükleniyor...</p>
    </div>
  ),
})

export default async function NewInvoicePage() {
  const session = await getSession()
  if (!session) {
    redirect('/admin/login')
  }

  let clients: any[] = []
  let projects: any[] = []
  let defaultTaxRate = 0
  let defaultCurrency = 'CAD'

  try {
    const dataSource = await initializeDatabase()
    const context = await getAgencyContext(session)
    
    // Get clients
    const clientRepository = dataSource.getRepository(Client)
    const clientEntities = await clientRepository.find({
      where: context.agencyId ? { agencyId: context.agencyId } : {},
      order: { name: 'ASC' },
    })
    clients = clientEntities.map((client) => ({
      id: client.id,
      name: client.name,
      companyName: client.companyName,
      email: client.email,
    }))

    // Get projects
    const projectRepository = dataSource.getRepository(Project)
    const projectEntities = await projectRepository.find({
      where: context.agencyId ? { agencyId: context.agencyId } : {},
      order: { name: 'ASC' },
    })
    projects = projectEntities.map((project) => ({
      id: project.id,
      name: project.name,
      clientId: project.clientId,
    }))

    // Get agency settings for default tax rate and currency
    if (context.agencyId) {
      const agencyRepository = dataSource.getRepository(Agency)
      const agency = await agencyRepository.findOne({ where: { id: context.agencyId } })
      if (agency) {
        defaultTaxRate = Number(agency.taxRate) || 0
        defaultCurrency = agency.defaultCurrency || 'CAD'
      }
    }
  } catch (error) {
    console.error('Error fetching data for invoice form:', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Yeni Fatura Oluştur</h1>
        <p className="text-neutral-600">Yeni bir fatura oluşturun</p>
      </div>

      <InvoiceForm
        clients={clients}
        projects={projects}
        defaultTaxRate={defaultTaxRate}
        defaultCurrency={defaultCurrency}
      />
    </div>
  )
}
