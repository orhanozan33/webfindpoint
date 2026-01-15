'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConfirmModal } from './ConfirmModal'

interface InvoicesListProps {
  invoices: Array<{
    id: string
    invoiceNumber: string
    clientId: string
    client?: {
      id: string
      name: string
      companyName?: string
      email: string
    } | null
    projectId?: string
    project?: {
      id: string
      name: string
    } | null
    issueDate: Date | string
    dueDate: Date | string
    subtotal: number
    tax: number
    total: number
    currency: string
    status: string
    notes?: string
    pdfPath?: string
    createdAt: Date | string
    updatedAt: Date | string
  }>
}

export function InvoicesList({ invoices }: InvoicesListProps) {
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
      const response = await fetch(`/api/admin/invoices/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setConfirmDelete(null)
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Fatura silinemedi')
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

  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
        <p className="text-neutral-500 mb-4">Henüz fatura yok</p>
        <Link
          href="/admin/invoices/new"
          className="text-primary-600 hover:text-primary-700 font-semibold"
        >
          İlk faturanızı oluşturun
        </Link>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700'
      case 'sent':
        return 'bg-blue-100 text-blue-700'
      case 'overdue':
        return 'bg-red-100 text-red-700'
      case 'draft':
        return 'bg-neutral-100 text-neutral-700'
      default:
        return 'bg-neutral-100 text-neutral-700'
    }
  }

  return (
    <>
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Faturayı Sil"
        message={`"${confirmDelete?.name}" faturasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve faturaya ait tüm öğeler de silinecektir.`}
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
      {invoices.map((invoice) => (
        <div key={invoice.id} className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <Link
                href={`/admin/invoices/${invoice.id}`}
                className="font-semibold text-base text-neutral-900 hover:text-primary-600 block mb-1"
              >
                {invoice.invoiceNumber}
              </Link>
              <p className="text-sm text-neutral-600">{invoice.client?.name || '-'}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getStatusColor(invoice.status)}`}>
              {invoice.status === 'paid' ? 'Ödendi' :
               invoice.status === 'sent' ? 'Gönderildi' :
               invoice.status === 'overdue' ? 'Vadesi Geçti' :
               invoice.status === 'draft' ? 'Taslak' : invoice.status}
            </span>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 w-20">Tutar:</span>
              <span className="text-sm text-neutral-700 font-semibold flex-1">
                {invoice.currency} {Number(invoice.total).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 w-20">Düzenleme:</span>
              <span className="text-sm text-neutral-700 flex-1">
                {new Date(invoice.issueDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 w-20">Vade:</span>
              <span className="text-sm text-neutral-700 flex-1">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-3 border-t border-neutral-200">
            {invoice.pdfPath && (
              <a
                href={invoice.pdfPath}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-4 py-2 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors touch-manipulation"
                onClick={(e) => e.stopPropagation()}
              >
                PDF
              </a>
            )}
            <Link
              href={`/admin/invoices/${invoice.id}`}
              className="flex-1 text-center px-4 py-2 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors touch-manipulation"
            >
              Düzenle
            </Link>
            <button
              onClick={() => handleDeleteClick(invoice.id, invoice.invoiceNumber)}
              disabled={deleting === invoice.id}
              className="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors touch-manipulation disabled:opacity-50"
            >
              {deleting === invoice.id ? 'Siliniyor...' : 'Sil'}
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
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Fatura #</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Müşteri</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Tutar</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Düzenleme Tarihi</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Vade Tarihi</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Durum</th>
              <th className="px-4 lg:px-6 py-4 text-right text-sm font-semibold text-neutral-700">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-4 lg:px-6 py-4">
                  <Link
                    href={`/admin/invoices/${invoice.id}`}
                    className="font-semibold text-base text-neutral-900 hover:text-primary-600"
                  >
                    {invoice.invoiceNumber}
                  </Link>
                </td>
                <td className="px-4 lg:px-6 py-4 text-neutral-600">{invoice.client?.name || '-'}</td>
                <td className="px-4 lg:px-6 py-4 text-neutral-900 font-semibold">
                  {invoice.currency} {Number(invoice.total).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 lg:px-6 py-4 text-neutral-600">
                  {new Date(invoice.issueDate).toLocaleDateString()}
                </td>
                <td className="px-4 lg:px-6 py-4 text-neutral-600">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </td>
                <td className="px-4 lg:px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status === 'paid' ? 'Ödendi' :
                     invoice.status === 'sent' ? 'Gönderildi' :
                     invoice.status === 'overdue' ? 'Vadesi Geçti' :
                     invoice.status === 'draft' ? 'Taslak' : invoice.status}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {invoice.pdfPath && (
                      <a
                        href={invoice.pdfPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                      >
                        PDF
                      </a>
                    )}
                    <Link
                      href={`/admin/invoices/${invoice.id}`}
                      className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                    >
                      Düzenle
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(invoice.id, invoice.invoiceNumber)}
                      disabled={deleting === invoice.id}
                      className="text-red-600 hover:text-red-700 font-semibold text-sm disabled:opacity-50"
                    >
                      {deleting === invoice.id ? 'Siliniyor...' : 'Sil'}
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