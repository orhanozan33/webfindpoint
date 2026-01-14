import Link from 'next/link'

interface UpcomingRemindersProps {
  reminders: Array<{
    id: string
    type: string
    title: string
    description?: string
    dueDate: Date | string
    isCompleted: boolean
    createdAt: Date | string
    updatedAt: Date | string
  }>
}

export function UpcomingReminders({ reminders }: UpcomingRemindersProps) {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 border border-neutral-200 shadow-sm">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-neutral-900">Yaklaşan Hatırlatıcılar</h2>
        <Link
          href="/admin/reminders"
          className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-semibold touch-manipulation"
        >
          Tümünü Gör
        </Link>
      </div>
      {reminders.length === 0 ? (
        <p className="text-neutral-500 text-xs sm:text-sm">Yaklaşan hatırlatıcı yok</p>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-neutral-900 mb-1">{reminder.title}</h3>
                  {reminder.description && (
                    <p className="text-xs sm:text-sm text-neutral-600 mb-2">{reminder.description}</p>
                  )}
                  <p className="text-xs text-neutral-500">
                    Bitiş: {new Date(reminder.dueDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-semibold bg-primary-100 text-primary-700 rounded flex-shrink-0">
                  {reminder.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}