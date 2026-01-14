'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { locales, localeNames, type Locale } from '@/lib/i18n'
import { useState } from 'react'

export function Header() {
  const pathname = usePathname()
  const currentLocale = pathname?.split('/')[1] as Locale || 'en'
  const pathWithoutLocale = pathname?.replace(`/${currentLocale}`, '') || '/'

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link 
            href={`/${currentLocale}`}
            className="text-2xl font-bold bg-gradient-to-r from-white via-neon-cyan to-neon-blue bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:from-neon-blue hover:via-neon-cyan hover:to-white transition-all"
          >
            FindPoint
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={`/${currentLocale}${item.href}`}
                className="text-neutral-700 hover:text-primary-600 font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 text-neutral-700 hover:text-primary-600 font-medium transition-colors"
                aria-label="Change language"
              >
                {localeNames[currentLocale]}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {langMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setLangMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
                    {locales.map((locale) => (
                      <Link
                        key={locale}
                        href={`/${locale}${pathWithoutLocale}`}
                        className="block px-4 py-2 text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 transition-colors"
                        onClick={() => setLangMenuOpen(false)}
                      >
                        {localeNames[locale]}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-neutral-700 hover:text-primary-600"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-neutral-200 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={`/${currentLocale}${item.href}`}
                className="block py-2 text-neutral-700 hover:text-primary-600 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <p className="text-sm text-neutral-500 mb-2">Language</p>
              {locales.map((locale) => (
                <Link
                  key={locale}
                  href={`/${locale}${pathWithoutLocale}`}
                  className="block py-2 text-neutral-700 hover:text-primary-600 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {localeNames[locale]}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}