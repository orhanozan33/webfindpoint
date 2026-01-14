import { MetadataRoute } from 'next'
import { locales } from '@/lib/i18n'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://findpoint.ca'
  
  const routes = [
    '',
    '/portfolio',
    '/services',
    '/contact',
  ]

  const sitemapEntries: MetadataRoute.Sitemap = []

  locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: route === '' ? 1 : 0.8,
      })
    })
  })

  return sitemapEntries
}