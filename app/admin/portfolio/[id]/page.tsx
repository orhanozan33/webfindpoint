import { initializeDatabase } from '@/lib/db/database'
import { Portfolio } from '@/entities/Portfolio'
import { notFound } from 'next/navigation'
import { PortfolioForm } from '@/components/admin/PortfolioForm'

export default async function PortfolioEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let portfolio: any = null
  
  try {
    const dataSource = await initializeDatabase()
    const portfolioRepository = dataSource.getRepository(Portfolio)
    const portfolioEntity = await portfolioRepository.findOne({ where: { id } })

    if (!portfolioEntity) {
      notFound()
    }
    
    // Serialize portfolio to plain object
    portfolio = {
      id: portfolioEntity.id,
      title: portfolioEntity.title,
      titleFr: portfolioEntity.titleFr,
      titleTr: portfolioEntity.titleTr,
      description: portfolioEntity.description,
      descriptionFr: portfolioEntity.descriptionFr,
      descriptionTr: portfolioEntity.descriptionTr,
      category: portfolioEntity.category,
      technologies: portfolioEntity.technologies || [],
      image: portfolioEntity.image,
      projectUrl: portfolioEntity.projectUrl,
      isActive: portfolioEntity.isActive,
      sortOrder: portfolioEntity.sortOrder,
    }
  } catch (error) {
    console.error('Error fetching portfolio item:', error)
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Portföy Öğesini Düzenle</h1>
        <p className="text-neutral-600">Portföy öğesi bilgilerini güncelleyin</p>
      </div>

      <PortfolioForm portfolio={portfolio} />
    </div>
  )
}
