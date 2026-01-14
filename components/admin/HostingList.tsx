'use client'

import Link from 'next/link'

interface HostingListProps {
  hostingServices: Array<{
    id: string
    provider: string
    plan?: string
    startDate: Date | string
    endDate?: Date | string
    autoRenew: boolean
    monthlyCost?: number
    currency: string
    notes?: string
    projectId?: string
    project?: {
      id: string
      name: string
    } | null
    createdAt: Date | string
    updatedAt: Date | string
  }>
}

export function HostingList({ hostingServices }: HostingListProps) {
  if (hostingServices.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
        <p className="text-neutral-500 mb-4">Henüz hosting hizmeti yok</p>
        <Link
          href="/admin/hosting/new"
          className="text-primary-600 hover:text-primary-700 font-semibold"
        >
          İlk hosting hizmetinizi ekleyin
        </Link>
      </div>
    )
  }

  const isExpiringSoon = (endDate: Date | string | undefined) => {
    if (!endDate) return false
    const date = endDate instanceof Date ? endDate : new Date(endDate)
    if (isNaN(date.getTime())) return false
    const daysUntilExpiry = Math.ceil(
      (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
      {hostingServices.map((hosting) => (
        <div
          key={hosting.id}
          className={`bg-white rounded-xl border border-neutral-200 p-4 ${
            isExpiringSoon(hosting.endDate) ? 'border-yellow-300 bg-yellow-50/30' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-base text-neutral-900 mb-1">{hosting.provider}</div>
              {hosting.plan && (
                <p className="text-sm text-neutral-600">{hosting.plan}</p>
              )}
            </div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 w-20">Proje:</span>
              <span className="text-sm text-neutral-700 flex-1">{hosting.project?.name || 'Proje yok'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 w-20">Başlangıç:</span>
              <span className="text-sm text-neutral-700 flex-1">{new Date(hosting.startDate).toLocaleDateString()}</span>
            </div>
            {hosting.endDate && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 w-20">Bitiş:</span>
                <div className="flex-1">
                  <span className="text-sm text-neutral-700">{new Date(hosting.endDate).toLocaleDateString()}</span>
                  {isExpiringSoon(hosting.endDate) && (
                    <span className="ml-2 text-xs text-yellow-700 font-semibold">Yakında bitiyor</span>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 w-20">Otomatik:</span>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  hosting.autoRenew
                    ? 'bg-green-100 text-green-700'
                    : 'bg-neutral-100 text-neutral-700'
                }`}
              >
                {hosting.autoRenew ? 'Evet' : 'Hayır'}
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-neutral-200">
            <Link
              href={`/admin/hosting/${hosting.id}`}
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
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Sağlayıcı</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Proje</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Başlangıç</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Bitiş</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Otomatik Yenileme</th>
              <th className="px-4 lg:px-6 py-4 text-right text-sm font-semibold text-neutral-700">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {hostingServices.map((hosting) => (
              <tr
                key={hosting.id}
                className={`hover:bg-neutral-50 transition-colors ${
                  isExpiringSoon(hosting.endDate) ? 'bg-yellow-50' : ''
                }`}
              >
                <td className="px-4 lg:px-6 py-4">
                  <div>
                    <div className="font-semibold text-base text-neutral-900">{hosting.provider}</div>
                    {hosting.plan && (
                      <div className="text-sm text-neutral-600">{hosting.plan}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4 text-neutral-600">
                  {hosting.project?.name || 'Proje yok'}
                </td>
                <td className="px-4 lg:px-6 py-4 text-neutral-600">
                  {new Date(hosting.startDate).toLocaleDateString()}
                </td>
                <td className="px-4 lg:px-6 py-4">
                  {hosting.endDate ? (
                    <div>
                      <div className="text-neutral-600">
                        {new Date(hosting.endDate).toLocaleDateString()}
                      </div>
                      {isExpiringSoon(hosting.endDate) && (
                        <span className="text-xs text-yellow-700 font-semibold">Yakında bitiyor</span>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-4 lg:px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      hosting.autoRenew
                        ? 'bg-green-100 text-green-700'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {hosting.autoRenew ? 'Evet' : 'Hayır'}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 text-right">
                  <Link
                    href={`/admin/hosting/${hosting.id}`}
                    className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                  >
                    Düzenle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}