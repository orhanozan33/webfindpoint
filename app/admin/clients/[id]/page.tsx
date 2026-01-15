import { initializeDatabase } from '@/lib/db/database'
import { Client } from '@/entities/Client'
import { notFound } from 'next/navigation'
import { ClientForm } from '@/components/admin/ClientForm'

// Force dynamic rendering because we use cookies in admin layout
export const dynamic = 'force-dynamic'

export default async function ClientEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dataSource = await initializeDatabase()
  const clientRepository = dataSource.getRepository(Client)
  const client = await clientRepository.findOne({ where: { id } })

  if (!client) {
    notFound()
  }
  
  // Serialize entity to plain object
  const clientData = {
    id: client.id,
    name: client.name,
    companyName: client.companyName,
    email: client.email,
    phone: client.phone,
    notes: client.notes,
    status: client.status,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Müşteriyi Düzenle</h1>
        <p className="text-neutral-600">Müşteri bilgilerini güncelleyin</p>
      </div>

      <ClientForm client={clientData} />
    </div>
  )
}