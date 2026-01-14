import { AnimatedButton } from '@/components/ui/AnimatedButton'
import { type Locale } from '@/lib/i18n'

interface CallToActionProps {
  messages: {
    title: string
    description: string
    button: string
  }
  locale: Locale
}

export function CallToAction({ messages, locale }: CallToActionProps) {
  return (
    <section className="py-12 sm:py-16 md:py-24 lg:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 via-neon-blue/20 to-neon-purple/20 backdrop-blur-sm" />
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
            <span className="bg-gradient-to-r from-white via-neon-cyan to-neon-blue bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              {messages.title}
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-300 mb-6 sm:mb-8 px-4">
            {messages.description}
          </p>
          <AnimatedButton 
            href={`/${locale}/contact`} 
            variant="primary" 
            size="lg"
            pulse={true}
          >
            {messages.button}
          </AnimatedButton>
        </div>
      </div>
    </section>
  )
}