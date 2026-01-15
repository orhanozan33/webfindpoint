import { initializeDatabase } from '@/lib/db/database'
import { Payment } from '@/entities/Payment'
import { Project } from '@/entities/Project'
import { notFound } from 'next/navigation'
import { PaymentForm } from '@/components/admin/PaymentForm'

// Force dynamic rendering because we use cookies in admin layout
export const dynamic = 'force-dynamic'

export default async function PaymentEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let payment: any = null
  let projects: any[] = []
  
  try {
    const dataSource = await initializeDatabase()
    const paymentRepository = dataSource.getRepository(Payment)
    const paymentEntity = await paymentRepository.findOne({
      where: { id },
      relations: ['project'],
    })

    if (!paymentEntity) {
      notFound()
    }
    
    // Serialize payment to plain object
    payment = {
      id: paymentEntity.id,
      projectId: paymentEntity.projectId,
      amount: paymentEntity.amount,
      currency: paymentEntity.currency,
      status: paymentEntity.status,
      paymentDate: paymentEntity.paymentDate,
      notes: paymentEntity.notes,
    }
    
    const projectRepository = dataSource.getRepository(Project)
    const projectEntities = await projectRepository.find({
      relations: ['client'],
      order: { name: 'ASC' },
    })
    
    // Serialize projects to plain objects
    projects = projectEntities.map((project) => ({
      id: project.id,
      name: project.name,
      client: project.client ? {
        id: project.client.id,
        name: project.client.name,
      } : null,
    }))
  } catch (error) {
    console.error('Error fetching payment:', error)
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Ödemeyi Düzenle</h1>
        <p className="text-neutral-600">Ödeme bilgilerini güncelleyin</p>
      </div>

      <PaymentForm payment={payment} projects={projects} />
    </div>
  )
}
