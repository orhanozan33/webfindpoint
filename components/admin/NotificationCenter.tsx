'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Notification } from '@/entities/Notification'

interface NotificationCenterProps {
  agencyId?: string
}

export function NotificationCenter({ agencyId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 10 seconds (more frequent for real-time feel)
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [agencyId])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        // Total unread count includes both notifications and unread contacts
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: 'POST',
      })
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/admin/notifications/read-all', {
        method: 'POST',
      })
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'success':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-neutral-700 hover:text-neutral-900 transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-neutral-200 z-50 max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-neutral-900">Bildirimler</h3>
                  {unreadCount > 0 && (
                    <p className="text-xs text-neutral-500 mt-1">
                      {unreadCount} okunmamış bildirim
                    </p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Tümünü okundu işaretle
                  </button>
                )}
              </div>

              <div className="overflow-y-auto flex-1">
                {loading ? (
                  <div className="p-8 text-center text-neutral-500">
                    Yükleniyor...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500">
                    Bildirim yok
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-200">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-neutral-50 transition-colors cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => {
                          if (!notification.isRead) {
                            markAsRead(notification.id)
                          }
                          if (notification.link) {
                            window.location.href = notification.link
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                              !notification.isRead
                                ? 'bg-primary-600'
                                : 'bg-transparent'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-neutral-900 text-sm">
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-2">
                                {notification.type === 'contact_submission' && (
                                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                    Mesaj
                                  </span>
                                )}
                                <span
                                  className={`px-2 py-1 text-xs font-semibold rounded border ${getSeverityColor(
                                    notification.severity
                                  )}`}
                                >
                                  {notification.severity}
                                </span>
                              </div>
                            </div>
                            {notification.message && (
                              <p className="text-sm text-neutral-600 mt-1">
                                {notification.message}
                              </p>
                            )}
                            <p className="text-xs text-neutral-500 mt-2">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}