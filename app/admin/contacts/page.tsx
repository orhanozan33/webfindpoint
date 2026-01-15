import { initializeDatabase } from '@/lib/db/database'
import { Contact } from '@/entities/Contact'
import dynamicImport from 'next/dynamic'

// Force dynamic rendering because we use cookies in admin layout
export const dynamic = 'force-dynamic'

// Dynamic import to prevent useContext errors
const ContactsList = dynamicImport(() => import('@/components/admin/ContactsList').then((mod) => ({ default: mod.ContactsList })), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
      <p className="text-neutral-500">Yükleniyor...</p>
    </div>
  ),
})

export default async function ContactsPage() {
  let contacts: any[] = []
  
  try {
    const dataSource = await initializeDatabase()
    const contactRepository = dataSource.getRepository(Contact)
    const contactEntities = await contactRepository.find({
      order: { createdAt: 'DESC' },
    })
    
    // Serialize entities to plain objects
    contacts = contactEntities.map((contact) => ({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      message: contact.message,
      status: contact.status,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    }))
  } catch (error) {
    console.error('Error fetching contacts:', error)
  }

  const newCount = contacts.filter((c) => c.status === 'new').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">İletişim Formu Gönderileri</h1>
          <p className="text-neutral-600">
            İletişim formu gönderilerini yönetin {newCount > 0 && `(${newCount} yeni)`}
          </p>
        </div>
      </div>

      <ContactsList contacts={contacts} />
    </div>
  )
}