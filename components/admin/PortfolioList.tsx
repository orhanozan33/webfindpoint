'use client'

import Link from 'next/link'

interface PortfolioListProps {
  portfolioItems: Array<{
    id: string
    title: string
    description?: string
    category?: string
    technologies?: string[]
    image?: string
    projectUrl?: string
    isActive: boolean
    sortOrder: number
    createdAt: Date | string
    updatedAt: Date | string
  }>
}

export function PortfolioList({ portfolioItems }: PortfolioListProps) {
  if (portfolioItems.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
        <p className="text-neutral-500 mb-4">Henüz portföy öğesi yok</p>
        <Link
          href="/admin/portfolio/new"
          className="text-primary-600 hover:text-primary-700 font-semibold"
        >
          İlk portföy öğenizi ekleyin
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {portfolioItems.map((item) => (
        <div key={item.id} className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <Link
                href={`/admin/portfolio/${item.id}`}
                className="font-semibold text-base text-neutral-900 hover:text-primary-600 block mb-1"
              >
                {item.title}
              </Link>
              <p className="text-sm text-neutral-600">{item.category || '-'}</p>
            </div>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                item.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-neutral-100 text-neutral-700'
              }`}
            >
              {item.isActive ? 'Aktif' : 'Gizli'}
            </span>
          </div>
          {item.technologies && item.technologies.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {item.technologies.slice(0, 5).map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs bg-neutral-100 text-neutral-700 rounded"
                  >
                    {tech}
                  </span>
                ))}
                {item.technologies.length > 5 && (
                  <span className="text-xs text-neutral-500">+{item.technologies.length - 5}</span>
                )}
              </div>
            </div>
          )}
          <div className="pt-3 border-t border-neutral-200">
            <Link
              href={`/admin/portfolio/${item.id}`}
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
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Başlık</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Kategori</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Teknolojiler</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Durum</th>
              <th className="px-4 lg:px-6 py-4 text-right text-sm font-semibold text-neutral-700">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {portfolioItems.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-4 lg:px-6 py-4">
                  <Link
                    href={`/admin/portfolio/${item.id}`}
                    className="font-semibold text-base text-neutral-900 hover:text-primary-600"
                  >
                    {item.title}
                  </Link>
                </td>
                <td className="px-4 lg:px-6 py-4 text-neutral-600">{item.category || '-'}</td>
                <td className="px-4 lg:px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {item.technologies?.slice(0, 3).map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-neutral-100 text-neutral-700 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                    {item.technologies && item.technologies.length > 3 && (
                      <span className="text-xs text-neutral-500">+{item.technologies.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      item.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {item.isActive ? 'Aktif' : 'Gizli'}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 text-right">
                  <Link
                    href={`/admin/portfolio/${item.id}`}
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