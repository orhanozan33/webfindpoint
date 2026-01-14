import { getMessages } from '@/lib/i18n/get-messages'
import { type Locale } from '@/lib/i18n'
import dynamic from 'next/dynamic'
import type { Metadata } from 'next'
import { slideUp } from '@/lib/motion/variants'

// Dynamic import for MotionWrapper (client component)
const MotionWrapper = dynamic(() => import('@/components/motion/MotionWrapper').then((mod) => mod.MotionWrapper), {
  ssr: true,
})

// Dynamic import for PortfolioGrid to prevent useContext errors
const PortfolioGrid = dynamic(() => import('@/components/sections/PortfolioGrid').then((mod) => mod.PortfolioGrid), {
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
    title: messages.portfolio.title + ' | FindPoint',
    description: messages.portfolio.subtitle,
  }
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const messages = await getMessages(locale)

  // Split subtitle for styled display (locale-aware)
  const getSubtitleParts = (text: string, locale: string) => {
    if (locale === 'tr') {
      // TR: "Web tasarımı ve geliştirmede mükemmellik sergileme"
      const parts = text.split(' mükemmellik')
      return {
        first: parts[0] || text,
        second: parts[1] ? ' mükemmellik' + parts[1] : ''
      }
    } else if (locale === 'en') {
      // EN: "Showcasing excellence in web design and development"
      const parts = text.split(' in ')
      return {
        first: parts[0] || text.split(' ')[0],
        second: parts[1] ? ' in ' + parts[1] : (parts.length > 1 ? ' ' + text.split(' ').slice(1).join(' ') : '')
      }
    } else if (locale === 'fr') {
      // FR: "Excellence en design web et développement"
      const parts = text.split(' en ')
      return {
        first: parts[0] || text,
        second: parts[1] ? ' en ' + parts[1] : ''
      }
    }
    // Default: split by space, first word white, rest cyan
    const words = text.split(' ')
    return {
      first: words[0] || text,
      second: words.length > 1 ? ' ' + words.slice(1).join(' ') : ''
    }
  }
  
  const { first: firstPart, second: secondPart } = getSubtitleParts(messages.portfolio.subtitle, locale)

  return (
    <div className="animate-fade-in">
      {/* Hero Banner Section - Styled like the image */}
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
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight px-2">
                <span className="bg-gradient-to-r from-white via-neon-cyan to-neon-blue bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                  {firstPart}{secondPart}
                </span>
              </h1>
            </MotionWrapper>
            <MotionWrapper variants={slideUp} animateOnMount delay={0.4}>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-300 mt-3 sm:mt-4 opacity-90 px-4">
                {messages.portfolio.title}
              </p>
            </MotionWrapper>
          </div>
        </div>
      </div>

      {/* Portfolio Grid Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-24">
        <PortfolioGrid messages={messages.portfolio} locale={locale} />
      </div>
    </div>
  )
}