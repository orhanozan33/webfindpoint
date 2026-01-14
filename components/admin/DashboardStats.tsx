interface DashboardStatsProps {
  stats: {
    totalClients: number
    activeProjects: number
    newContacts: number
    totalRevenue: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      label: 'Toplam Müşteri',
      value: stats.totalClients,
      icon: '👥',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Aktif Projeler',
      value: stats.activeProjects,
      icon: '💼',
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Yeni İletişimler',
      value: stats.newContacts,
      icon: '📧',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Toplam Gelir',
      value: `$${stats.totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
      icon: '💰',
      color: 'bg-yellow-50 text-yellow-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-3 sm:p-4 md:p-6 border border-neutral-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
            <span className={`text-2xl sm:text-3xl ${stat.color} p-2 sm:p-3 rounded-lg`}>
              {stat.icon}
            </span>
          </div>
          <div>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 mb-1">{stat.value}</p>
            <p className="text-xs sm:text-sm text-neutral-600">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}