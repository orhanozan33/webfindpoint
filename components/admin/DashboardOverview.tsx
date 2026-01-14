interface DashboardOverviewProps {
  stats: {
    totalClients: number
    activeProjects: number
    totalRevenue: number
    outstandingPayments: number
  }
}

export function DashboardOverview({ stats }: DashboardOverviewProps) {
  const cards = [
    {
      label: 'Total Clients',
      value: stats.totalClients,
      icon: '👥',
      color: 'bg-blue-50 text-blue-600',
      trend: '+12%',
    },
    {
      label: 'Active Projects',
      value: stats.activeProjects,
      icon: '💼',
      color: 'bg-green-50 text-green-600',
      trend: '+5',
    },
    {
      label: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString('en-CA', { minimumFractionDigits: 2 })}`,
      icon: '💰',
      color: 'bg-yellow-50 text-yellow-600',
      trend: '+18%',
    },
    {
      label: 'Outstanding',
      value: `$${stats.outstandingPayments.toLocaleString('en-CA', { minimumFractionDigits: 2 })}`,
      icon: '⚠️',
      color: 'bg-red-50 text-red-600',
      trend: '-3%',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`text-3xl ${card.color} p-3 rounded-lg`}>
              {card.icon}
            </div>
            <span className="text-sm font-semibold text-green-600">{card.trend}</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 mb-1">{card.value}</p>
            <p className="text-sm text-neutral-600">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}