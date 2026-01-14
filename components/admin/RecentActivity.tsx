import Link from 'next/link'

interface RecentActivityProps {
  projects: Array<{
    id: string
    name: string
    description?: string
    type: string
    status: string
    price?: number
    currency: string
    clientId: string
    client?: {
      id: string
      name: string
    } | null
    createdAt: Date | string
    updatedAt: Date | string
  }>
}

export function RecentActivity({ projects }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 border border-neutral-200 shadow-sm">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-neutral-900">Son Projeler</h2>
        <Link
          href="/admin/projects"
          className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-semibold touch-manipulation"
        >
          Tümünü Gör
        </Link>
      </div>
      {projects.length === 0 ? (
        <p className="text-neutral-500 text-xs sm:text-sm">Son proje yok</p>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/admin/projects/${project.id}`}
              className="block p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition-colors touch-manipulation"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-neutral-900 mb-1">{project.name}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 mb-2">
                    {project.client?.name || 'Müşteri yok'}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {new Date(project.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded flex-shrink-0 ${
                    project.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : project.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  {project.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}