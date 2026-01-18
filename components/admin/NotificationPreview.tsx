'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SessionPayload } from '@/lib/auth/session'
type UINotification = {
  id: string
  title: string
  message?: string | null
  link?: string | null
  type?: string
  severity?: string
  isRead: boolean
  createdAt: string | Date
}

interface NotificationPreviewProps {
  session: SessionPayload
}

export function NotificationPreview({ session }: NotificationPreviewProps) {
  const [notifications, setNotifications] = useState<UINotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications?limit=5')
      if (response.status === 401) {
        // Session expired / not authorized
        setNotifications([])
        setUnreadCount(0)
        return
      }
      if (response.ok) {
        const data = await response.json()
        setNotifications((data.notifications || []) as UINotification[])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Bildirimler</h2>
        <p className="text-neutral-500 text-sm">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 border border-neutral-200 shadow-sm">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-neutral-900">Bildirimler</h2>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
              {unreadCount} yeni
            </span>
          )}
          <Link
            href="/admin/notifications"
            className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-semibold touch-manipulation"
          >
            Tümünü Gör
          </Link>
        </div>
      </div>
      {notifications.length === 0 ? (
        <p className="text-neutral-500 text-sm">Bildirim yok</p>
      ) : (
        <div className="space-y-3">
          {notifications.slice(0, 5).map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border ${
                !notification.isRead
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900 text-sm mb-1">
                    {notification.title}
                  </h3>
                  {notification.message && (
                    <p className="text-xs text-neutral-600 line-clamp-2">
                      {notification.message}
                    </p>
                  )}
                  <p className="text-xs text-neutral-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString('tr-TR')}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}