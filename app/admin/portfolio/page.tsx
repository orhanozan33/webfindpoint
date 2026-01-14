import { initializeDatabase } from '@/lib/db/database'
import { Portfolio } from '@/entities/Portfolio'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Dynamic import to prevent useContext errors
const PortfolioList = dynamic(() => import('@/components/admin/PortfolioList').then((mod) => ({ default: mod.PortfolioList })), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
      <p className="text-neutral-500">Yükleniyor...</p>
    </div>
  ),
})

export default async function PortfolioPage() {
  let portfolioItems: any[] = []
  
  try {
    const dataSource = await initializeDatabase()
    const portfolioRepository = dataSource.getRepository(Portfolio)
    const portfolioEntities = await portfolioRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    })
    
    // Serialize entities to plain objects
    portfolioItems = portfolioEntities.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      technologies: item.technologies,
      image: item.image,
      projectUrl: item.projectUrl,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }))
  } catch (error) {
    console.error('Error fetching portfolio items:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Portföy</h1>
          <p className="text-neutral-600">Halka açık web sitesi için portföy öğelerini yönetin</p>
        </div>
        <Link
          href="/admin/portfolio/new"
          className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Portföy Öğesi Ekle
        </Link>
      </div>

      <PortfolioList portfolioItems={portfolioItems} />
    </div>
  )
}