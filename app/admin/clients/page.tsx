import { initializeDatabase } from '@/lib/db/database'
import { Client } from '@/entities/Client'
import dynamicImport from 'next/dynamic'
import Link from 'next/link'

// Force dynamic rendering because we use cookies in admin layout
export const dynamic = 'force-dynamic'

// Dynamic import to prevent useContext errors
const ClientsList = dynamicImport(() => import('@/components/admin/ClientsList').then((mod) => ({ default: mod.ClientsList })), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
      <p className="text-neutral-500">Yükleniyor...</p>
    </div>
  ),
})

export default async function ClientsPage() {
  let clients: any[] = []
  
  try {
    const dataSource = await initializeDatabase()
    const clientRepository = dataSource.getRepository(Client)
    // Only fetch necessary fields and limit results for performance
    const clientEntities = await clientRepository.find({
      select: ['id', 'name', 'companyName', 'email', 'phone', 'notes', 'status', 'createdAt', 'updatedAt'],
      order: { createdAt: 'DESC' },
      take: 100, // Limit to 100 clients for performance
    })
    
    // Serialize entities to plain objects
    clients = clientEntities.map((client) => ({
      id: client.id,
      name: client.name,
      companyName: client.companyName,
      email: client.email,
      phone: client.phone,
      notes: client.notes,
      status: client.status,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    }))
  } catch (error) {
    console.error('Error fetching clients:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Müşteriler</h1>
          <p className="text-neutral-600">Müşterilerinizi ve bilgilerini yönetin</p>
        </div>
        <Link
          href="/admin/clients/new"
          className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Müşteri Ekle
        </Link>
      </div>

      <ClientsList clients={clients} />
    </div>
  )
}