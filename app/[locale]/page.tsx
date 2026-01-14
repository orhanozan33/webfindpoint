import { getMessages } from '@/lib/i18n/get-messages'
import { type Locale } from '@/lib/i18n'
import { Hero } from '@/components/sections/Hero'
import { Services } from '@/components/sections/Services'
import { Portfolio } from '@/components/sections/Portfolio'
import { WhyFindPoint } from '@/components/sections/WhyFindPoint'
import { CallToAction } from '@/components/sections/CallToAction'
import { FadeIn } from '@/components/motion/FadeIn'
import { MotionWrapper } from '@/components/motion/MotionWrapper'
import { slideUp } from '@/lib/motion/variants'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const messages = await getMessages(locale)

  // Safe access with fallbacks
  const title = messages?.home?.hero?.title || 'FindPoint - Premium Web Design Agency'
  const description = messages?.home?.hero?.subtitle || 'Modern web design and development for Canadian businesses.'

  return {
    title: title + ' | FindPoint - Premium Web Design Agency',
    description: description,
    keywords: ['web design', 'web development', 'UI/UX', 'Canada', 'custom websites', 'digital agency'],
    authors: [{ name: 'FindPoint' }],
    openGraph: {
      title: title + ' | FindPoint',
      description: description,
      type: 'website',
      locale: locale === 'fr' ? 'fr_CA' : locale === 'tr' ? 'tr_TR' : 'en_CA',
      siteName: 'FindPoint',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
    },
    alternates: {
      canonical: `https://findpoint.ca/${locale}`,
      languages: {
        'en': 'https://findpoint.ca/en',
        'fr': 'https://findpoint.ca/fr',
        'tr': 'https://findpoint.ca/tr',
      },
    },
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  try {
    const { locale } = await params
    
    // Validate locale
    if (!locale || !['en', 'fr', 'tr'].includes(locale)) {
      throw new Error(`Invalid locale: ${locale}`)
    }
    
    const messages = await getMessages(locale as Locale)

    // Safe access with fallbacks to prevent 500 errors
    if (!messages || !messages.home) {
      console.error('Messages not loaded properly for locale:', locale)
      // Fallback to default locale
      const defaultMessages = await getMessages('en')
      if (!defaultMessages || !defaultMessages.home) {
        throw new Error('Default messages also failed to load')
      }
      // Use default messages but keep original locale
      const safeMessages = {
        ...defaultMessages,
        home: defaultMessages.home,
      }
      
      return (
        <>
          <MotionWrapper variants={slideUp} animateOnMount delay={0.2}>
            <Hero messages={safeMessages.home.hero} locale={locale as Locale} />
          </MotionWrapper>
          <FadeIn delay={0.1}>
            <Services messages={safeMessages.home.services} />
          </FadeIn>
          <FadeIn delay={0.2}>
            <Portfolio messages={safeMessages.home.featuredPortfolio} locale={locale as Locale} />
          </FadeIn>
          <FadeIn delay={0.1}>
            <WhyFindPoint messages={safeMessages.home.whyFindPoint} />
          </FadeIn>
          <FadeIn delay={0.2}>
            <CallToAction messages={safeMessages.home.cta} locale={locale as Locale} />
          </FadeIn>
        </>
      )
    }

  return (
    <>
      {/* Hero Section - FadeIn + slideUp on mount with background motion */}
      <MotionWrapper variants={slideUp} animateOnMount delay={0.2}>
        <Hero messages={messages.home.hero || { title: '', subtitle: '', ctaPrimary: '', ctaSecondary: '' }} locale={locale} />
      </MotionWrapper>

      {/* Services Section - Scroll-based stagger reveal with hover lift */}
      <FadeIn delay={0.1}>
        <Services messages={messages.home.services || { title: '', subtitle: '', webDesign: { title: '', description: '' }, uiux: { title: '', description: '' }, development: { title: '', description: '' }, optimization: { title: '', description: '' } }} />
      </FadeIn>

      {/* Portfolio Section - Scroll reveal with hover zoom + optional parallax */}
      <FadeIn delay={0.2}>
        <Portfolio messages={messages.home.featuredPortfolio || { title: '', subtitle: '', viewAll: '' }} locale={locale} />
      </FadeIn>

      {/* Why FindPoint Section - Floating icons */}
      <FadeIn delay={0.1}>
        <WhyFindPoint messages={messages.home.whyFindPoint || { title: '', subtitle: '', canada: { title: '', description: '' }, fast: { title: '', description: '' }, modern: { title: '', description: '' }, clientFocused: { title: '', description: '' } }} />
      </FadeIn>

      {/* CTA Section - Pulse button animation */}
      <FadeIn delay={0.2}>
        <CallToAction messages={messages.home.cta || { title: '', description: '', button: '' }} locale={locale} />
      </FadeIn>
    </>
    )
  } catch (error) {
    console.error('Error rendering HomePage:', error)
    // Return error page instead of crashing
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4 text-red-600">Error Loading Page</h1>
        <p className="text-neutral-600 mb-4">An error occurred while loading the page.</p>
        <p className="text-sm text-neutral-500">{error instanceof Error ? error.message : 'Unknown error'}</p>
        <a href="/en" className="mt-4 inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          Go to English Version
        </a>
      </div>
    )
  }
}