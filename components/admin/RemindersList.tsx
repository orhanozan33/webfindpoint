'use client'

import Link from 'next/link'
import { useState } from 'react'

interface ReminderData {
  id: string
  type: string
  title: string
  description?: string
  dueDate: Date | string
  isCompleted: boolean
  completedAt?: Date | string
  notificationStatus: string
  lastNotifiedAt?: Date | string
  notificationAttempts: number
  relatedEntityType?: string
  relatedEntityId?: string
  daysBeforeReminder: number
  createdAt: Date | string
  updatedAt: Date | string
}

interface RemindersListProps {
  reminders: ReminderData[]
  completed: ReminderData[]
}

export function RemindersList({ reminders, completed }: RemindersListProps) {
  const [showCompleted, setShowCompleted] = useState(false)
  const displayReminders = showCompleted ? completed : reminders

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hosting_expiration':
        return 'bg-red-100 text-red-700'
      case 'service_renewal':
        return 'bg-blue-100 text-blue-700'
      case 'payment_due':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-neutral-100 text-neutral-700'
    }
  }

  const isOverdue = (dueDate: Date | string) => {
    const date = dueDate instanceof Date ? dueDate : new Date(dueDate)
    if (isNaN(date.getTime())) return false
    return date < new Date()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">
          {showCompleted ? 'Tamamlanan Hatırlatıcılar' : 'Yaklaşan Hatırlatıcılar'}
        </h2>
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
        >
          {showCompleted ? 'Yaklaşanları Göster' : 'Tamamlananları Göster'}
        </button>
      </div>

      {displayReminders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
          <p className="text-neutral-500">
            {showCompleted ? 'Tamamlanan hatırlatıcı yok' : 'Yaklaşan hatırlatıcı yok'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
          {displayReminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`bg-white rounded-xl border border-neutral-200 p-4 ${
                !showCompleted && isOverdue(reminder.dueDate) ? 'border-red-300 bg-red-50/30' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base text-neutral-900 mb-1">{reminder.title}</h3>
                  {reminder.description && (
                    <p className="text-sm text-neutral-600 mb-2">{reminder.description}</p>
                  )}
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getTypeColor(reminder.type)}`}>
                  {reminder.type === 'hosting_expiration' ? 'Hosting Bitişi' :
                   reminder.type === 'service_renewal' ? 'Hizmet Yenileme' :
                   reminder.type === 'payment_due' ? 'Ödeme Vadesi' : reminder.type}
                </span>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 w-20">Bitiş:</span>
                  <div className="flex-1">
                    <span className="text-sm text-neutral-700">{new Date(reminder.dueDate).toLocaleDateString()}</span>
                    {!showCompleted && isOverdue(reminder.dueDate) && (
                      <span className="ml-2 text-xs text-red-700 font-semibold">Gecikmiş</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 w-20">Durum:</span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      reminder.isCompleted
                        ? 'bg-green-100 text-green-700'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {reminder.isCompleted ? 'Tamamlandı' : 'Beklemede'}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-neutral-200">
                <Link
                  href={`/admin/reminders/${reminder.id}`}
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
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Tip</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Bitiş Tarihi</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Durum</th>
                  <th className="px-4 lg:px-6 py-4 text-right text-sm font-semibold text-neutral-700">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {displayReminders.map((reminder) => (
                  <tr
                    key={reminder.id}
                    className={`hover:bg-neutral-50 transition-colors ${
                      !showCompleted && isOverdue(reminder.dueDate) ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="px-4 lg:px-6 py-4">
                      <div>
                        <div className="font-semibold text-base text-neutral-900">{reminder.title}</div>
                        {reminder.description && (
                          <div className="text-sm text-neutral-600 mt-1">{reminder.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getTypeColor(reminder.type)}`}>
                        {reminder.type === 'hosting_expiration' ? 'Hosting Bitişi' :
                         reminder.type === 'service_renewal' ? 'Hizmet Yenileme' :
                         reminder.type === 'payment_due' ? 'Ödeme Vadesi' : reminder.type}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="text-neutral-600">
                        {new Date(reminder.dueDate).toLocaleDateString()}
                      </div>
                      {!showCompleted && isOverdue(reminder.dueDate) && (
                        <span className="text-xs text-red-700 font-semibold">Gecikmiş</span>
                      )}
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          reminder.isCompleted
                            ? 'bg-green-100 text-green-700'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {reminder.isCompleted ? 'Tamamlandı' : 'Beklemede'}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-right">
                      <Link
                        href={`/admin/reminders/${reminder.id}`}
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
      )}
    </div>
  )
}