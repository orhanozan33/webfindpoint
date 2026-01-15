import { initializeDatabase } from '@/lib/db/database'
import { Project } from '@/entities/Project'
import { Client } from '@/entities/Client'
import { notFound } from 'next/navigation'
import { ProjectForm } from '@/components/admin/ProjectForm'

// Force dynamic rendering because we use cookies in admin layout
export const dynamic = 'force-dynamic'

export default async function ProjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dataSource = await initializeDatabase()
  
  const projectRepository = dataSource.getRepository(Project)
  const project = await projectRepository.findOne({
    where: { id },
    relations: ['client'],
  })

  if (!project) {
    notFound()
  }

  const clientRepository = dataSource.getRepository(Client)
  const clientEntities = await clientRepository.find({ where: { status: 'active' } })
  
  // Serialize entities to plain objects
  const clients = clientEntities.map((client) => ({
    id: client.id,
    name: client.name,
    companyName: client.companyName,
    email: client.email,
  }))
  
  // Serialize project to plain object
  const projectData = {
    id: project.id,
    name: project.name,
    description: project.description,
    type: project.type,
    clientId: project.clientId,
    startDate: project.startDate,
    deliveryDate: project.deliveryDate,
    status: project.status,
    price: project.price,
    currency: project.currency,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Projeyi Düzenle</h1>
        <p className="text-neutral-600">Proje bilgilerini güncelleyin</p>
      </div>

      <ProjectForm project={projectData} clients={clients} />
    </div>
  )
}