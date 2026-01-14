import { getMessages } from '@/lib/i18n/get-messages'
import { type Locale } from '@/lib/i18n'
import dynamic from 'next/dynamic'
import type { Metadata } from 'next'
import { slideUp } from '@/lib/motion/variants'

// Dynamic import for MotionWrapper (client component)
const MotionWrapper = dynamic(() => import('@/components/motion/MotionWrapper').then((mod) => mod.MotionWrapper), {
  ssr: true,
})

// Dynamic import for ContactForm to prevent useContext errors
const ContactForm = dynamic(() => import('@/components/forms/ContactForm').then((mod) => mod.ContactForm), {
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
    title: messages.contact.title + ' | FindPoint',
    description: messages.contact.subtitle,
  }
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const messages = await getMessages(locale)

  // Split title for styled display (locale-aware)
  const getTitleParts = (text: string, locale: string) => {
    if (locale === 'tr') {
      // TR: "İletişime Geçin" -> "İletişime" (beyaz) + " Geçin" (cyan)
      const parts = text.split(' Geçin')
      return {
        first: parts[0] || text,
        second: parts[1] ? ' Geçin' + parts[1] : ''
      }
    } else if (locale === 'en') {
      // EN: "Get In Touch" -> "Get In" (beyaz) + " Touch" (cyan)
      const words = text.split(' ')
      const mid = Math.ceil(words.length / 2)
      return {
        first: words.slice(0, mid).join(' '),
        second: words.length > mid ? ' ' + words.slice(mid).join(' ') : ''
      }
    } else if (locale === 'fr') {
      // FR: "Contactez-Nous" -> "Contactez" (beyaz) + "-Nous" (cyan)
      const parts = text.split('-')
      return {
        first: parts[0] || text,
        second: parts.length > 1 ? '-' + parts.slice(1).join('-') : ''
      }
    }
    // Default: split by space, first word(s) white, rest cyan
    const words = text.split(' ')
    const mid = Math.ceil(words.length / 2)
    return {
      first: words.slice(0, mid).join(' '),
      second: words.length > mid ? ' ' + words.slice(mid).join(' ') : ''
    }
  }

  // Split subtitle for styled display (locale-aware)
  const getSubtitleParts = (text: string, locale: string) => {
    if (locale === 'tr') {
      // TR: "Projenizi tartışalım ve nasıl yardımcı olabileceğimizi görelim"
      const parts = text.split(' ve nasıl')
      return {
        first: parts[0] || text.split(' ').slice(0, 3).join(' '),
        second: parts[1] ? ' ve nasıl' + parts[1] : (text.split(' ').length > 3 ? ' ' + text.split(' ').slice(3).join(' ') : '')
      }
    } else if (locale === 'en') {
      // EN: "Let's discuss your project and see how we can help"
      const parts = text.split(' and see')
      return {
        first: parts[0] || text.split(' ').slice(0, 4).join(' '),
        second: parts[1] ? ' and see' + parts[1] : (parts.length > 1 ? ' ' + text.split(' ').slice(4).join(' ') : '')
      }
    } else if (locale === 'fr') {
      // FR: "Discutons de votre projet et voyons comment nous pouvons vous aider"
      const parts = text.split(' et voyons')
      return {
        first: parts[0] || text,
        second: parts[1] ? ' et voyons' + parts[1] : ''
      }
    }
    // Default: split by space, first half white, rest cyan
    const words = text.split(' ')
    const mid = Math.ceil(words.length / 2)
    return {
      first: words.slice(0, mid).join(' '),
      second: words.length > mid ? ' ' + words.slice(mid).join(' ') : ''
    }
  }
  
  const { first: titleFirst, second: titleSecond } = getTitleParts(messages.contact.title, locale)
  const { first: subtitleFirst, second: subtitleSecond } = getSubtitleParts(messages.contact.subtitle, locale)

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

      {/* Contact Form Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="max-w-2xl mx-auto">
          <ContactForm messages={messages.contact} />
          <div className="mt-6 sm:mt-8 text-center text-neutral-300 px-4">
            <p className="mb-2 text-sm sm:text-base">{messages.contact.info.location}</p>
            <p className="mb-2 text-sm sm:text-base">{messages.contact.info.response}</p>
            <p className="text-cyan-400 text-sm sm:text-base">{messages.contact.info.phone}</p>
          </div>
        </div>
      </div>
    </div>
  )
}