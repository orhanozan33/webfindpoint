import { initializeDatabase } from '@/lib/db/database'
import { Project } from '@/entities/Project'
import dynamicImport from 'next/dynamic'
import Link from 'next/link'

// Force dynamic rendering because we use cookies in admin layout
export const dynamic = 'force-dynamic'

// Dynamic import to prevent useContext errors
const ProjectsList = dynamicImport(() => import('@/components/admin/ProjectsList').then((mod) => ({ default: mod.ProjectsList })), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
      <p className="text-neutral-500">Yükleniyor...</p>
    </div>
  ),
})

export default async function ProjectsPage() {
  let projects: any[] = []
  let errorMessage: string | null = null
  
  try {
    const dataSource = await initializeDatabase()
    const projectRepository = dataSource.getRepository(Project)
    // Only fetch necessary fields and limit results for performance
    const projectEntities = await projectRepository.find({
      select: ['id', 'name', 'description', 'type', 'startDate', 'deliveryDate', 'status', 'price', 'currency', 'clientId', 'createdAt', 'updatedAt'],
      relations: ['client'],
      relationLoadStrategy: 'query', // Use query strategy for better performance
      order: { createdAt: 'DESC' },
      take: 100, // Limit to 100 projects for performance
    })
    
    // Serialize entities to plain objects
    projects = projectEntities.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      type: project.type,
      startDate: project.startDate,
      deliveryDate: project.deliveryDate,
      status: project.status,
      price: project.price,
      currency: project.currency,
      clientId: project.clientId,
      client: project.client ? {
        id: project.client.id,
        name: project.client.name,
        companyName: project.client.companyName,
        email: project.client.email,
      } : null,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }))
  } catch (error) {
    console.error('Error fetching projects:', error)
    errorMessage = error instanceof Error ? error.message : 'Unknown error'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Projeler</h1>
          <p className="text-neutral-600">Projelerinizi yönetin ve ilerlemelerini takip edin</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Proje Ekle
        </Link>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm">
          Projeler yüklenemedi: {errorMessage}
        </div>
      )}

      <ProjectsList projects={projects} />
    </div>
  )
}