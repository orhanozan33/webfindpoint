'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConfirmModal } from './ConfirmModal'

interface ProjectsListProps {
  projects: Array<{
    id: string
    name: string
    description?: string
    type: string
    startDate?: Date | string
    deliveryDate?: Date | string
    status: string
    price?: number
    currency: string
    clientId: string
    client?: {
      id: string
      name: string
      companyName?: string
      email: string
    } | null
    createdAt: Date | string
    updatedAt: Date | string
  }>
}

export function ProjectsList({ projects }: ProjectsListProps) {
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
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setConfirmDelete(null)
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Proje silinemedi')
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

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
        <p className="text-neutral-500 mb-4">Henüz proje yok</p>
        <Link
          href="/admin/projects/new"
          className="text-primary-600 hover:text-primary-700 font-semibold"
        >
          İlk projenizi ekleyin
        </Link>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'in-progress':
        return 'bg-blue-100 text-blue-700'
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-700'
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
        title="Projeyi Sil"
        message={`"${confirmDelete?.name}" projesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve projeye ait tüm ödemeler ve hosting servisleri de silinecektir.`}
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
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="font-semibold text-base text-neutral-900 hover:text-primary-600 block mb-1"
                >
                  {project.name}
                </Link>
                <p className="text-sm text-neutral-600">{project.client?.name || '-'}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getStatusColor(project.status)}`}>
                {project.status === 'completed' ? 'Tamamlandı' : 
                 project.status === 'in-progress' ? 'Devam Ediyor' :
                 project.status === 'on-hold' ? 'Beklemede' :
                 project.status === 'review' ? 'İnceleme' :
                 project.status === 'planning' ? 'Planlama' : project.status}
              </span>
            </div>
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 w-16">Tip:</span>
                <span className="text-sm text-neutral-700 flex-1">{project.type}</span>
              </div>
              {project.price && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 w-16">Fiyat:</span>
                  <span className="text-sm text-neutral-700 font-semibold flex-1">
                    {project.currency} {project.price.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-neutral-200">
              <Link
                href={`/admin/projects/${project.id}`}
                className="flex-1 text-center px-4 py-2 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors touch-manipulation"
              >
                Düzenle
              </Link>
              <button
                onClick={() => handleDeleteClick(project.id, project.name)}
                disabled={deleting === project.id}
                className="flex-1 text-center px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                {deleting === project.id ? 'Siliniyor...' : 'Sil'}
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
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Proje</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Müşteri</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Tip</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Durum</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Fiyat</th>
              <th className="px-4 lg:px-6 py-4 text-right text-sm font-semibold text-neutral-700">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-4 lg:px-6 py-4">
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="font-semibold text-base text-neutral-900 hover:text-primary-600"
                  >
                    {project.name}
                  </Link>
                </td>
                <td className="px-4 lg:px-6 py-4 text-neutral-600">{project.client?.name || '-'}</td>
                <td className="px-4 lg:px-6 py-4 text-neutral-600">{project.type}</td>
                <td className="px-4 lg:px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                    {project.status === 'completed' ? 'Tamamlandı' : 
                     project.status === 'in-progress' ? 'Devam Ediyor' :
                     project.status === 'on-hold' ? 'Beklemede' :
                     project.status === 'review' ? 'İnceleme' :
                     project.status === 'planning' ? 'Planlama' : project.status}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 text-neutral-600">
                  {project.price
                    ? `${project.currency} ${project.price.toLocaleString('en-CA', { minimumFractionDigits: 2 })}`
                    : '-'}
                </td>
                <td className="px-4 lg:px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                    >
                      Düzenle
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(project.id, project.name)}
                      disabled={deleting === project.id}
                      className="text-red-600 hover:text-red-700 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting === project.id ? 'Siliniyor...' : 'Sil'}
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