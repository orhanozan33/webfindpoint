'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

const navItems = [
  { href: '/admin', label: 'Kontrol Paneli', icon: '📊' },
  { href: '/admin/clients', label: 'Müşteriler', icon: '👥' },
  { href: '/admin/projects', label: 'Projeler', icon: '💼' },
  { href: '/admin/payments', label: 'Ödemeler', icon: '💰' },
  { href: '/admin/invoices', label: 'Faturalar', icon: '🧾' },
  { href: '/admin/hosting', label: 'Hosting', icon: '🌐' },
  { href: '/admin/reminders', label: 'Hatırlatıcılar', icon: '🔔' },
  { href: '/admin/portfolio', label: 'Portföy', icon: '🎨' },
  { href: '/admin/contacts', label: 'İletişimler', icon: '📧' },
  { href: '/admin/settings', label: 'Ayarlar', icon: '⚙️' },
]

export function AdminSidebarClient() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  const handleLinkClick = useCallback(() => {
    // Close menu immediately when link is clicked
    setIsMobileOpen(false)
  }, [])

  return (
    <>
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <aside className="hidden md:block md:static w-64 bg-white border-r border-neutral-200">
        <nav className="p-4 space-y-2">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <motion.div
                  whileHover={{ x: 4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={item.href}
                    prefetch={true}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all min-h-[44px] relative overflow-hidden ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-r-full"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <motion.span
                      className="text-xl"
                      animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {item.icon}
                    </motion.span>
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              </motion.div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}