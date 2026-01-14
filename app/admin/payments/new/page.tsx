import { initializeDatabase } from '@/lib/db/database'
import { Project } from '@/entities/Project'
import { PaymentForm } from '@/components/admin/PaymentForm'

export default async function NewPaymentPage() {
  let projects: any[] = []
  
  try {
    const dataSource = await initializeDatabase()
    const projectRepository = dataSource.getRepository(Project)
    const projectEntities = await projectRepository.find({
      relations: ['client'],
    })
    
    // Serialize entities to plain objects
    projects = projectEntities.map((project) => ({
      id: project.id,
      name: project.name,
      client: project.client ? {
        id: project.client.id,
        name: project.client.name,
      } : null,
    }))
  } catch (error) {
    console.error('Error fetching projects:', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Yeni Ödeme</h1>
        <p className="text-neutral-600">Yeni bir ödeme kaydedin</p>
      </div>

      <PaymentForm projects={projects} />
    </div>
  )
}