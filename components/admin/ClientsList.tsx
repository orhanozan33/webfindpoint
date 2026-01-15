'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConfirmModal } from './ConfirmModal'

interface ClientsListProps {
  clients: Array<{
    id: string
    name: string
    companyName?: string
    email: string
    phone?: string
    notes?: string
    status: string
    createdAt: Date | string
    updatedAt: Date | string
  }>
}

export function ClientsList({ clients }: ClientsListProps) {
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
      const response = await fetch(`/api/admin/clients/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setConfirmDelete(null)
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Müşteri silinemedi')
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

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
        <p className="text-neutral-500 mb-4">Henüz müşteri yok</p>
        <Link
          href="/admin/clients/new"
          className="text-primary-600 hover:text-primary-700 font-semibold"
        >
          İlk müşterinizi ekleyin
        </Link>
      </div>
    )
  }

  return (
    <>
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Müşteriyi Sil"
        message={`"${confirmDelete?.name}" müşterisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve müşteriye ait tüm projeler, faturalar ve diğer kayıtlar da silinecektir.`}
        confirmText="Sil"
        cancelText="İptal"
        variant="danger"
        loading={deleting === confirmDelete?.id}
      />

      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
            {error}
          </div>
        )}
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {clients.map((client) => (
          <div key={client.id} className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <Link
                  href={`/admin/clients/${client.id}`}
                  className="font-semibold text-base text-neutral-900 hover:text-primary-600 block mb-1"
                >
                  {client.name}
                </Link>
                <p className="text-sm text-neutral-600">{client.companyName || '-'}</p>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                  client.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-neutral-100 text-neutral-700'
                }`}
              >
                {client.status === 'active' ? 'Aktif' : 'Pasif'}
              </span>
            </div>
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 w-16">E-posta:</span>
                <span className="text-sm text-neutral-700 flex-1 truncate">{client.email}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 w-16">Telefon:</span>
                  <span className="text-sm text-neutral-700 flex-1">{client.phone}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-neutral-200">
              <Link
                href={`/admin/clients/${client.id}`}
                className="flex-1 text-center px-4 py-2 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors touch-manipulation"
              >
                Düzenle
              </Link>
              <button
                onClick={() => handleDeleteClick(client.id, client.name)}
                disabled={deleting === client.id}
                className="flex-1 text-center px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                {deleting === client.id ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Ad Soyad</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Şirket</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">E-posta</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Telefon</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Durum</th>
              <th className="px-4 lg:px-6 py-4 text-right text-sm font-semibold text-neutral-700">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-4 lg:px-6 py-4">
                  <Link
                    href={`/admin/clients/${client.id}`}
                    className="font-semibold text-base text-neutral-900 hover:text-primary-600"
                  >
                    {client.name}
                  </Link>
                </td>
                <td className="px-4 lg:px-6 py-4 text-neutral-600">{client.companyName || '-'}</td>
                <td className="px-4 lg:px-6 py-4 text-neutral-600">{client.email}</td>
                <td className="px-4 lg:px-6 py-4 text-neutral-600">{client.phone || '-'}</td>
                <td className="px-4 lg:px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      client.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {client.status === 'active' ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                    >
                      Düzenle
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(client.id, client.name)}
                      disabled={deleting === client.id}
                      className="text-red-600 hover:text-red-700 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting === client.id ? 'Siliniyor...' : 'Sil'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  )
}