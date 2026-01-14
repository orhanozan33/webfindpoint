import { notFound } from 'next/navigation'
import { locales, type Locale } from '@/lib/i18n'
import { getMessages } from '@/lib/i18n/get-messages'
import dynamic from 'next/dynamic'
import { AnimatedNetwork } from '@/components/background/AnimatedNetwork'

// Dynamic imports for client components to prevent useContext errors
const Header = dynamic(() => import('@/components/layout/Header').then((mod) => mod.Header), {
  ssr: false,
})

const Footer = dynamic(() => import('@/components/layout/Footer').then((mod) => mod.Footer), {
  ssr: false,
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}) {
  try {
    const { locale } = await params
    
    if (!locale || !locales.includes(locale)) {
      notFound()
    }

    // Preload messages with error handling
    try {
      await getMessages(locale)
    } catch (error) {
      console.error('Error preloading messages for locale:', locale, error)
      // Continue anyway, messages will be loaded in page component
    }

    return (
      <div className="relative min-h-screen bg-[#0a1628]">
        {/* Animated Network Background - Admin hariç tüm public sayfalarda */}
        <AnimatedNetwork className="opacity-60" />
        
        <div className="relative z-10">
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in LocaleLayout:', error)
    // Return minimal error layout
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Error Loading Page</h1>
          <p className="text-neutral-400">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <a href="/en" className="mt-4 inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Go to English Version
          </a>
        </div>
      </div>
    )
  }
}