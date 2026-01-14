import { initializeDatabase } from '@/lib/db/database'
import { Client } from '@/entities/Client'
import { ProjectForm } from '@/components/admin/ProjectForm'

export default async function NewProjectPage() {
  let clients: any[] = []
  
  try {
    const dataSource = await initializeDatabase()
    const clientRepository = dataSource.getRepository(Client)
    const clientEntities = await clientRepository.find({ where: { status: 'active' } })
    
    // Serialize entities to plain objects
    clients = clientEntities.map((client) => ({
      id: client.id,
      name: client.name,
      companyName: client.companyName,
      email: client.email,
    }))
  } catch (error) {
    console.error('Error fetching clients:', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Yeni Proje</h1>
        <p className="text-neutral-600">Yeni bir proje oluşturun</p>
      </div>

      <ProjectForm clients={clients} />
    </div>
  )
}