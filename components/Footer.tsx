'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type Locale } from '@/lib/i18n'

export function Footer() {
  const pathname = usePathname()
  const currentLocale = (pathname?.split('/')[1] as Locale) || 'en'

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-neon-cyan to-neon-blue bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)] mb-4">
              FindPoint
            </h3>
            <p className="text-neutral-400">Modern web design and development for Canadian businesses.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${currentLocale}/portfolio`} className="hover:text-primary-400 transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/services`} className="hover:text-primary-400 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/contact`} className="hover:text-primary-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Location</h4>
            <p className="text-neutral-400">Canada</p>
            <p className="text-neutral-400 mt-2">Based in Canada, serving clients worldwide</p>
          </div>
        </div>
        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
          <p>&copy; {new Date().getFullYear()} FindPoint. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}