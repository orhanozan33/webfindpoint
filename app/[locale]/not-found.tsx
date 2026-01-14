import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { type Locale } from '@/lib/i18n'

export default function NotFound({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center px-4">
        <h1 className="text-6xl md:text-8xl font-bold text-neutral-900 mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-neutral-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-neutral-600 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button href="/en" variant="primary" size="lg">
          Go Home
        </Button>
      </div>
    </div>
  )
}