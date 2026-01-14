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
    <header className="sticky top-0 z-50 bg-dark-surface/80 backdrop-blur-md border-b border-dark-border/50 shadow-lg shadow-primary-500/10">
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
                className="text-neutral-200 hover:text-neon-cyan font-medium transition-colors relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-neon-cyan group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}

            {/* Language Switcher - Desktop */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 text-neutral-200 hover:text-neon-cyan font-medium transition-colors"
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
                  <div className="absolute right-0 mt-2 w-40 bg-dark-surface/95 backdrop-blur-md rounded-lg shadow-xl border border-dark-border py-2 z-50">
                    {locales.map((locale) => (
                      <Link
                        key={locale}
                        href={`/${locale}${pathWithoutLocale}`}
                        className="block px-4 py-2 text-neutral-200 hover:bg-dark-border/50 hover:text-neon-cyan transition-colors"
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

          {/* Mobile: Language Switcher + Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Language Switcher - Mobile: Small boxes */}
            <div className="flex items-center gap-1.5">
              {locales.map((locale) => (
                <Link
                  key={locale}
                  href={`/${locale}${pathWithoutLocale}`}
                  className={`px-2 py-1 text-xs font-semibold rounded transition-all ${
                    currentLocale === locale
                      ? 'bg-neon-cyan text-dark-surface'
                      : 'bg-dark-border/50 text-neutral-200 hover:bg-dark-border hover:text-neon-cyan'
                  }`}
                >
                  {locale.toUpperCase()}
                </Link>
              ))}
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-neutral-200 hover:text-neon-cyan transition-colors"
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
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-dark-border pt-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={`/${currentLocale}${item.href}`}
                className="block py-2 text-neutral-200 hover:text-neon-cyan font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  )
}