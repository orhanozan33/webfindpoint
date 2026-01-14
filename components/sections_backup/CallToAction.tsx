import { Button } from '@/components/Button'
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
    <section className="py-20 md:py-32 bg-primary-600 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {messages.title}
          </h2>
          <p className="text-xl md:text-2xl text-primary-100 mb-8">
            {messages.description}
          </p>
          <Button href={`/${locale}/contact`} variant="secondary" size="lg">
            {messages.button}
          </Button>
        </div>
      </div>
    </section>
  )
}