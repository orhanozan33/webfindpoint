'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type Locale } from '@/lib/i18n'

export function Footer() {
  const pathname = usePathname()
  const currentLocale = (pathname?.split('/')[1] as Locale) || 'en'

  return (
    <footer className="bg-dark-surface/50 backdrop-blur-md border-t border-dark-border text-neutral-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-neon-cyan to-neon-blue bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)] mb-4">
              FindPoint
            </h3>
            <p className="text-neutral-400 text-sm md:text-base">Modern web design and development for Canadian businesses.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${currentLocale}/portfolio`} className="hover:text-neon-cyan transition-colors text-sm md:text-base">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/services`} className="hover:text-neon-cyan transition-colors text-sm md:text-base">
                  Services
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/contact`} className="hover:text-neon-cyan transition-colors text-sm md:text-base">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">Location</h4>
            <p className="text-neutral-400 text-sm md:text-base">Canada</p>
            <p className="text-neutral-400 mt-2 text-sm md:text-base">Based in Canada, serving clients worldwide</p>
          </div>
        </div>
        <div className="border-t border-dark-border mt-8 pt-8 text-center text-neutral-400">
          <p>&copy; {new Date().getFullYear()} FindPoint. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}