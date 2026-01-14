import { initializeDatabase } from '@/lib/db/database'
import { Project } from '@/entities/Project'
import { HostingForm } from '@/components/admin/HostingForm'

export default async function NewHostingPage() {
  let projects: any[] = []
  
  try {
    const dataSource = await initializeDatabase()
    const projectRepository = dataSource.getRepository(Project)
    const projectEntities = await projectRepository.find({
      order: { name: 'ASC' },
    })
    
    // Serialize entities to plain objects
    projects = projectEntities.map((project) => ({
      id: project.id,
      name: project.name,
    }))
  } catch (error) {
    console.error('Error fetching projects:', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Yeni Hosting Hizmeti</h1>
        <p className="text-neutral-600">Yeni bir hosting hizmeti ekleyin</p>
      </div>

      <HostingForm projects={projects} />
    </div>
  )
}
