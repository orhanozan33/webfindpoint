'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConfirmModal } from './ConfirmModal'

interface PaymentsListProps {
  payments: Array<{
    id: string
    amount: number
    currency: string
    status: string
    paymentDate?: Date | string
    notes?: string
    projectId: string
    project?: {
      id: string
      name: string
    } | null
    createdAt: Date | string
    updatedAt: Date | string
  }>
}

export function PaymentsList({ payments }: PaymentsListProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null)

  const handleDeleteClick = (id: string, name: string) => {
    setConfirmDelete({ id, name })
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return

    const { id } = confirmDelete
    setDeleting(id)
    setError('')

    try {
      const response = await fetch(`/api/admin/payments/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setConfirmDelete(null)
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Ödeme silinemedi')
        setConfirmDelete(null)
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
      console.error('Delete error:', err)
      setConfirmDelete(null)
    } finally {
      setDeleting(null)
    }
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
        <p className="text-neutral-500 mb-4">Henüz ödeme yok</p>
        <Link
          href="/admin/payments/new"
          className="text-primary-600 hover:text-primary-700 font-semibold"
        >
          İlk ödemenizi ekleyin
        </Link>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700'
      case 'partial':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-red-100 text-red-700'
    }
  }

  return (
    <>
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Ödemeyi Sil"
        message={`Bu ödemeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        variant="danger"
        loading={deleting === confirmDelete?.id}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
      {payments.map((payment) => (
        <div key={payment.id} className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <Link
                href={`/admin/projects/${payment.projectId}`}
                className="font-semibold text-base text-neutral-900 hover:text-primary-600 block mb-1"
              >
                {payment.project?.name || '-'}
              </Link>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getStatusColor(payment.status)}`}>
              {payment.status === 'paid' ? 'Ödendi' : 
               payment.status === 'partial' ? 'Kısmi' : 'Ödenmedi'}
            </span>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 w-16">Tutar:</span>
              <span className="text-sm text-neutral-700 font-semibold flex-1">
                {payment.currency} {Number(payment.amount).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {payment.paymentDate && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 w-16">Tarih:</span>
                <span className="text-sm text-neutral-700 flex-1">
                  {new Date(payment.paymentDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          <div className="pt-3 border-t border-neutral-200">
            <Link
              href={`/admin/payments/${payment.id}`}
              className="block w-full text-center px-4 py-2 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors touch-manipulation"
            >
              Düzenle
            </Link>
          </div>
        </div>
      ))}
    </div>

    {/* Desktop Table View */}
    <div className="hidden md:block bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-neutral-50 border-b border-neutral-200">
          <tr>
            <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Proje</th>
            <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Tutar</th>
            <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Durum</th>
            <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Tarih</th>
            <th className="px-4 lg:px-6 py-4 text-right text-sm font-semibold text-neutral-700">İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-neutral-50 transition-colors">
              <td className="px-4 lg:px-6 py-4">
                <Link
                  href={`/admin/projects/${payment.projectId}`}
                  className="font-semibold text-base text-neutral-900 hover:text-primary-600"
                >
                  {payment.project?.name || '-'}
                </Link>
              </td>
              <td className="px-4 lg:px-6 py-4 text-neutral-900 font-semibold">
                {payment.currency} {Number(payment.amount).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 lg:px-6 py-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                  {payment.status === 'paid' ? 'Ödendi' : 
                   payment.status === 'partial' ? 'Kısmi' : 'Ödenmedi'}
                </span>
              </td>
              <td className="px-4 lg:px-6 py-4 text-neutral-600">
                {payment.paymentDate
                  ? new Date(payment.paymentDate).toLocaleDateString()
                  : '-'}
              </td>
              <td className="px-4 lg:px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/payments/${payment.id}`}
                    className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                  >
                    Düzenle
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(payment.id, payment.project?.name || payment.id)}
                    disabled={deleting === payment.id}
                    className="text-red-600 hover:text-red-700 font-semibold text-sm disabled:opacity-50"
                  >
                    {deleting === payment.id ? 'Siliniyor...' : 'Sil'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  )
}