import { getMessages } from '@/lib/i18n/get-messages'
import { type Locale } from '@/lib/i18n'
import { ServicesDetail } from '@/components/sections/ServicesDetail'
import dynamic from 'next/dynamic'
import type { Metadata } from 'next'
import { slideUp } from '@/lib/motion/variants'

// Dynamic import for MotionWrapper (client component)
const MotionWrapper = dynamic(() => import('@/components/motion/MotionWrapper').then((mod) => mod.MotionWrapper), {
  ssr: true,
})

// Dynamic import for CallToAction to prevent useContext errors
const CallToAction = dynamic(() => import('@/components/sections/CallToAction').then((mod) => mod.CallToAction), {
  ssr: false,
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const messages = await getMessages(locale)

  return {
    title: messages.services.title + ' | FindPoint',
    description: messages.services.subtitle,
  }
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const messages = await getMessages(locale)

  // Split title for styled display (locale-aware)
  const getTitleParts = (text: string, locale: string) => {
    if (locale === 'tr') {
      // TR: "Hizmetlerimiz" -> "Hizmetler" (beyaz) + "imiz" (cyan)
      if (text.includes('Hizmetlerimiz')) {
        return { first: 'Hizmetler', second: 'imiz' }
      }
    } else if (locale === 'en') {
      // EN: "Our Services" -> "Our" (beyaz) + " Services" (cyan)
      const parts = text.split(' ')
      return {
        first: parts[0] || text,
        second: parts.length > 1 ? ' ' + parts.slice(1).join(' ') : ''
      }
    } else if (locale === 'fr') {
      // FR: "Nos Services" -> "Nos" (beyaz) + " Services" (cyan)
      const parts = text.split(' ')
      return {
        first: parts[0] || text,
        second: parts.length > 1 ? ' ' + parts.slice(1).join(' ') : ''
      }
    }
    // Default: split by space, first word white, rest cyan
    const words = text.split(' ')
    return {
      first: words[0] || text,
      second: words.length > 1 ? ' ' + words.slice(1).join(' ') : ''
    }
  }

  // Split subtitle for styled display (locale-aware)
  const getSubtitleParts = (text: string, locale: string) => {
    if (locale === 'tr') {
      // TR: "Kanadalı işletmeler için özel olarak hazırlanmış kapsamlı dijital çözümler"
      const parts = text.split(' kapsamlı')
      return {
        first: parts[0] || text.split(' ').slice(0, 4).join(' '),
        second: parts[1] ? ' kapsamlı' + parts[1] : (text.split(' ').length > 4 ? ' ' + text.split(' ').slice(4).join(' ') : '')
      }
    } else if (locale === 'en') {
      // EN: "Comprehensive digital solutions tailored for Canadian businesses"
      const parts = text.split(' for ')
      return {
        first: parts[0] || text.split(' ')[0],
        second: parts[1] ? ' for ' + parts[1] : (parts.length > 1 ? ' ' + text.split(' ').slice(1).join(' ') : '')
      }
    } else if (locale === 'fr') {
      // FR: "Solutions numériques complètes adaptées aux entreprises canadiennes"
      const parts = text.split(' adaptées')
      return {
        first: parts[0] || text,
        second: parts[1] ? ' adaptées' + parts[1] : ''
      }
    }
    // Default: split by space, first few words white, rest cyan
    const words = text.split(' ')
    const mid = Math.ceil(words.length / 2)
    return {
      first: words.slice(0, mid).join(' '),
      second: words.length > mid ? ' ' + words.slice(mid).join(' ') : ''
    }
  }
  
  const { first: titleFirst, second: titleSecond } = getTitleParts(messages.services.title, locale)
  const { first: subtitleFirst, second: subtitleSecond } = getSubtitleParts(messages.services.subtitle, locale)

  return (
    <div className="animate-fade-in">
      {/* Hero Banner Section - Styled like portfolio page */}
      <div className="relative bg-[#0a1628] py-12 sm:py-16 md:py-24 lg:py-28 overflow-hidden">
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
              linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.1) 50%, transparent 100%)
            `,
            backgroundSize: '100% 100%',
          }} />
          {/* Grid pattern */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center">
            <MotionWrapper variants={slideUp} animateOnMount delay={0.2}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 leading-tight px-2">
                <span className="bg-gradient-to-r from-white via-neon-cyan to-neon-blue bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                  {titleFirst}{titleSecond}
                </span>
              </h1>
            </MotionWrapper>
            <MotionWrapper variants={slideUp} animateOnMount delay={0.4}>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-300 mt-3 sm:mt-4 opacity-90 max-w-3xl mx-auto px-4">
                <span className="bg-gradient-to-r from-white via-neon-cyan to-neon-blue bg-clip-text text-transparent">
                  {subtitleFirst}{subtitleSecond}
                </span>
              </p>
            </MotionWrapper>
          </div>
        </div>
      </div>

      {/* Services Detail Section */}
      <div className="bg-[#0a1628]">
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-24">
          <ServicesDetail messages={messages.services} />
        </div>
      </div>
      <CallToAction messages={messages.services.cta} locale={locale} />
    </div>
  )
}