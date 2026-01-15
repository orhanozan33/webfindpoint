import { initializeDatabase } from '@/lib/db/database'
import { HostingService } from '@/entities/HostingService'
import dynamicImport from 'next/dynamic'
import Link from 'next/link'

// Force dynamic rendering because we use cookies in admin layout
export const dynamic = 'force-dynamic'

// Dynamic import to prevent useContext errors
const HostingList = dynamicImport(() => import('@/components/admin/HostingList').then((mod) => ({ default: mod.HostingList })), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
      <p className="text-neutral-500">Yükleniyor...</p>
    </div>
  ),
})

export default async function HostingPage() {
  let hostingServices: any[] = []
  
  try {
    const dataSource = await initializeDatabase()
    const hostingRepository = dataSource.getRepository(HostingService)
    // Only fetch necessary fields and limit results for performance
    const hostingEntities = await hostingRepository.find({
      select: ['id', 'provider', 'plan', 'startDate', 'endDate', 'autoRenew', 'monthlyCost', 'currency', 'notes', 'projectId', 'createdAt', 'updatedAt'],
      relations: ['project'],
      relationLoadStrategy: 'query', // Use query strategy for better performance
      order: { startDate: 'DESC' },
      take: 100, // Limit to 100 hosting services for performance
    })
    
    // Serialize entities to plain objects
    hostingServices = hostingEntities.map((hosting) => ({
      id: hosting.id,
      provider: hosting.provider,
      plan: hosting.plan,
      startDate: hosting.startDate,
      endDate: hosting.endDate,
      autoRenew: hosting.autoRenew,
      monthlyCost: hosting.monthlyCost,
      currency: hosting.currency,
      notes: hosting.notes,
      projectId: hosting.projectId,
      project: hosting.project ? {
        id: hosting.project.id,
        name: hosting.project.name,
      } : null,
      createdAt: hosting.createdAt,
      updatedAt: hosting.updatedAt,
    }))
  } catch (error) {
    console.error('Error fetching hosting services:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Hosting Hizmetleri</h1>
          <p className="text-neutral-600">Hosting ve hizmet aboneliklerini yönetin</p>
        </div>
        <Link
          href="/admin/hosting/new"
          className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Hosting Ekle
        </Link>
      </div>

      <HostingList hostingServices={hostingServices} />
    </div>
  )
}