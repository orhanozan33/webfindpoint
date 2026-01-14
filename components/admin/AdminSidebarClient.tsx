'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useCallback } from 'react'

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
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[44px] ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}