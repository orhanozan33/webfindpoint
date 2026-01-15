import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic'

// Dynamic import to prevent useContext errors
const SmoothScrollProvider = dynamic(
  () => import('@/components/motion/SmoothScrollProvider').then((mod) => ({ default: mod.SmoothScrollProvider })),
  { ssr: false }
)

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://findpoint.ca'),
  title: {
    default: 'FindPoint - Premium Web Design & Development Agency | Canada',
    template: '%s | FindPoint',
  },
  description: 'Professional web design and development services for Canadian businesses. Custom websites, UI/UX design, and performance optimization.',
  keywords: ['web design', 'web development', 'UI/UX', 'Canada', 'custom websites', 'performance optimization', 'digital agency'],
  authors: [{ name: 'FindPoint', url: 'https://findpoint.ca' }],
  creator: 'FindPoint',
  publisher: 'FindPoint',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: 'https://findpoint.ca',
    siteName: 'FindPoint',
    title: 'FindPoint - Premium Web Design & Development Agency',
    description: 'Professional web design and development services for Canadian businesses.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FindPoint - Premium Web Design Agency',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FindPoint - Premium Web Design & Development Agency',
    description: 'Professional web design and development services for Canadian businesses.',
    creator: '@findpoint',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  )
}