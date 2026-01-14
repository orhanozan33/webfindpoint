import { initializeDatabase } from '@/lib/db/database'
import { HostingService } from '@/entities/HostingService'
import { Project } from '@/entities/Project'
import { notFound } from 'next/navigation'
import { HostingForm } from '@/components/admin/HostingForm'

export default async function HostingEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let hosting: any = null
  let projects: any[] = []
  
  try {
    const dataSource = await initializeDatabase()
    const hostingRepository = dataSource.getRepository(HostingService)
    const hostingEntity = await hostingRepository.findOne({ where: { id } })

    if (!hostingEntity) {
      notFound()
    }
    
    // Serialize hosting to plain object
    hosting = {
      id: hostingEntity.id,
      provider: hostingEntity.provider,
      plan: hostingEntity.plan,
      startDate: hostingEntity.startDate,
      endDate: hostingEntity.endDate,
      autoRenew: hostingEntity.autoRenew,
      monthlyCost: hostingEntity.monthlyCost,
      currency: hostingEntity.currency,
      notes: hostingEntity.notes,
      projectId: hostingEntity.projectId,
    }
    
    const projectRepository = dataSource.getRepository(Project)
    const projectEntities = await projectRepository.find({
      order: { name: 'ASC' },
    })
    
    // Serialize projects to plain objects
    projects = projectEntities.map((project) => ({
      id: project.id,
      name: project.name,
    }))
  } catch (error) {
    console.error('Error fetching hosting service:', error)
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Hosting Hizmetini Düzenle</h1>
        <p className="text-neutral-600">Hosting hizmeti bilgilerini güncelleyin</p>
      </div>

      <HostingForm hosting={hosting} projects={projects} />
    </div>
  )
}
