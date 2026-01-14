'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Panel', icon: '📊' },
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

export function MobileBottomNavClient() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50 md:hidden shadow-lg">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 px-2 py-2 min-w-max">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors touch-manipulation min-w-[70px] flex-shrink-0 ${
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-neutral-600 active:bg-neutral-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-semibold whitespace-nowrap">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}