import { initializeDatabase } from '@/lib/db/database'
import { Payment } from '@/entities/Payment'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Dynamic import to prevent useContext errors
const PaymentsList = dynamic(() => import('@/components/admin/PaymentsList').then((mod) => ({ default: mod.PaymentsList })), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
      <p className="text-neutral-500">Yükleniyor...</p>
    </div>
  ),
})

export default async function PaymentsPage() {
  let payments: any[] = []
  let totalPaid = 0
  let totalUnpaid = 0
  
  try {
    const dataSource = await initializeDatabase()
    const paymentRepository = dataSource.getRepository(Payment)
    // Only fetch necessary fields and limit results for performance
    const paymentEntities = await paymentRepository.find({
      select: ['id', 'amount', 'currency', 'status', 'paymentDate', 'notes', 'projectId', 'createdAt', 'updatedAt'],
      relations: ['project'],
      relationLoadStrategy: 'query', // Use query strategy for better performance
      order: { createdAt: 'DESC' },
      take: 100, // Limit to 100 payments for performance
    })

    // Serialize entities to plain objects
    payments = paymentEntities.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentDate: payment.paymentDate,
      notes: payment.notes,
      projectId: payment.projectId,
      project: payment.project ? {
        id: payment.project.id,
        name: payment.project.name,
        client: payment.project.client ? {
          id: payment.project.client.id,
          name: payment.project.client.name,
        } : null,
      } : null,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    }))

    // Calculate totals
    totalPaid = payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount), 0)
    totalUnpaid = payments
      .filter((p) => p.status === 'unpaid')
      .reduce((sum, p) => sum + Number(p.amount), 0)
  } catch (error) {
    console.error('Error fetching payments:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Ödemeler</h1>
          <p className="text-neutral-600">Ödemeleri ve finansal durumu takip edin</p>
        </div>
        <Link
          href="/admin/payments/new"
          className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Ödeme Ekle
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <p className="text-sm text-neutral-600 mb-2">Toplam Ödenen</p>
          <p className="text-2xl font-bold text-green-600">
            ${totalPaid.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <p className="text-sm text-neutral-600 mb-2">Toplam Ödenmeyen</p>
          <p className="text-2xl font-bold text-red-600">
            ${totalUnpaid.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <p className="text-sm text-neutral-600 mb-2">Toplam Ödeme</p>
          <p className="text-2xl font-bold text-neutral-900">{payments.length}</p>
        </div>
      </div>

      <PaymentsList payments={payments} />
    </div>
  )
}