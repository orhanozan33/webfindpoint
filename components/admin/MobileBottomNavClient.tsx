'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

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
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={item.href}
                  prefetch={true}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all touch-manipulation min-w-[70px] flex-shrink-0 relative ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-neutral-600 active:bg-neutral-100'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveIndicator"
                      className="absolute top-0 left-0 right-0 h-1 bg-primary-600 rounded-b-full"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <motion.span
                    className="text-xl"
                    animate={isActive ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    {item.icon}
                  </motion.span>
                  <span className="text-xs font-semibold whitespace-nowrap">{item.label}</span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </nav>
  )
}