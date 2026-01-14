import { Reminder } from '@/entities/Reminder'
import { differenceInDays } from 'date-fns'
import Link from 'next/link'

interface UpcomingRenewalsProps {
  renewals: Reminder[]
}

export function UpcomingRenewals({ renewals }: UpcomingRenewalsProps) {
  if (renewals.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Upcoming Renewals</h2>
        <p className="text-neutral-500 text-sm">No upcoming renewals</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-neutral-900">Upcoming Renewals</h2>
        <Link
          href="/admin/reminders"
          className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
        >
          View All
        </Link>
      </div>
      <div className="space-y-3">
        {renewals.map((renewal) => {
          const daysUntil = differenceInDays(new Date(renewal.dueDate), new Date())
          const isUrgent = daysUntil <= 7

          return (
            <div
              key={renewal.id}
              className={`p-4 rounded-lg border ${
                isUrgent
                  ? 'bg-red-50 border-red-200'
                  : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">{renewal.title}</h3>
                  {renewal.description && (
                    <p className="text-sm text-neutral-600 mb-2">{renewal.description}</p>
                  )}
                  <p className="text-xs text-neutral-500">
                    Due: {new Date(renewal.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    isUrgent
                      ? 'bg-red-100 text-red-700'
                      : daysUntil <= 30
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  {daysUntil <= 0 ? 'Overdue' : `${daysUntil} days`}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}