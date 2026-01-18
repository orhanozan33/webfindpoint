'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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

export function NotificationsPageClient() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<UINotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const hasUnread = useMemo(() => unreadCount > 0, [unreadCount])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications?limit=100')
      if (response.status === 401) {
        router.push('/admin/login')
        return
      }
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/admin/notifications/${notificationId}/read`, { method: 'POST' })
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/admin/notifications/read-all', { method: 'POST' })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
        <p className="text-neutral-500 text-sm">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-neutral-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900">Tüm Bildirimler</h2>
          {hasUnread && (
            <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
              {unreadCount} yeni
            </span>
          )}
        </div>

        {hasUnread && (
          <button
            onClick={markAllAsRead}
            className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-semibold touch-manipulation"
          >
            Tümünü okundu işaretle
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center text-neutral-500">Bildirim yok</div>
      ) : (
        <div className="divide-y divide-neutral-200">
          {notifications.map((notification) => (
            <motion.button
              key={notification.id}
              type="button"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-full text-left p-4 sm:p-5 hover:bg-neutral-50 transition-colors ${
                !notification.isRead ? 'bg-blue-50/50' : ''
              }`}
              onClick={async () => {
                if (!notification.isRead) {
                  await markAsRead(notification.id)
                }
                if (notification.link) {
                  router.push(notification.link)
                }
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    !notification.isRead ? 'bg-primary-600' : 'bg-transparent'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-neutral-900 text-sm sm:text-base">
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {notification.type === 'contact_submission' && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                          Mesaj
                        </span>
                      )}
                      {notification.severity && (
                        <span className="px-2 py-1 text-xs font-semibold rounded border bg-neutral-100 text-neutral-700 border-neutral-200">
                          {notification.severity}
                        </span>
                      )}
                    </div>
                  </div>
                  {notification.message && (
                    <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                  )}
                  <p className="text-xs text-neutral-500 mt-2">
                    {new Date(notification.createdAt).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

