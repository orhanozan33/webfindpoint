import { Button } from '@/components/Button'
import { type Locale } from '@/lib/i18n'

interface HeroProps {
  messages: {
    title: string
    subtitle: string
    ctaPrimary: string
    ctaSecondary: string
  }
  locale: Locale
}

export function Hero({ messages, locale }: HeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-neutral-50 to-white py-20 md:py-32 lg:py-40">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center animate-slide-up">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-6 leading-tight">
            {messages.title}
          </h1>
          <p className="text-xl md:text-2xl text-neutral-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            {messages.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href={`/${locale}/contact`} variant="primary" size="lg">
              {messages.ctaPrimary}
            </Button>
            <Button href={`/${locale}/portfolio`} variant="outline" size="lg">
              {messages.ctaSecondary}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}