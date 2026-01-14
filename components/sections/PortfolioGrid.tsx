'use client'

import { StaggerContainer } from '@/components/motion/StaggerContainer'
import { StaggerItem } from '@/components/motion/StaggerItem'
import { motion } from 'framer-motion'
import { hoverScale } from '@/lib/motion/variants'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n'

interface PortfolioGridProps {
  messages: {
    viewProject: string
    technologies: string
  }
  locale?: Locale
}

interface PortfolioItem {
  id: number
  title: string
  titleFr: string
  titleTr: string
  description: string
  descriptionFr: string
  descriptionTr: string
  technologies: string[]
  category?: string
  image?: string
  projectUrl?: string
}

export function PortfolioGrid({ messages, locale = 'en' }: PortfolioGridProps) {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  useEffect(() => {
    async function fetchPortfolioItems() {
      try {
        const response = await fetch('/api/portfolio')
        if (response.ok) {
          const data = await response.json()
          setPortfolioItems(data)
        } else {
          console.error('Failed to fetch portfolio items')
        }
      } catch (error) {
        console.error('Error fetching portfolio items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolioItems()
  }, [])

  // Get locale-specific title and description
  const getLocalizedTitle = (item: PortfolioItem) => {
    if (locale === 'fr') return item.titleFr || item.title
    if (locale === 'tr') return item.titleTr || item.title
    return item.title
  }

  const getLocalizedDescription = (item: PortfolioItem) => {
    if (locale === 'fr') return item.descriptionFr || item.description
    if (locale === 'tr') return item.descriptionTr || item.description
    return item.description
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-neutral-300 text-lg">Yükleniyor...</div>
      </div>
    )
  }

  if (portfolioItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-neutral-300 text-lg">Henüz portfolyo öğesi yok.</div>
      </div>
    )
  }
  return (
    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
      {portfolioItems.map((item) => {
        const title = getLocalizedTitle(item)
        const description = getLocalizedDescription(item)
        const content = item.projectUrl ? (
          <Link href={item.projectUrl} target="_blank" rel="noopener noreferrer" className="block touch-manipulation">
            <motion.div
              className="group bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-cyan-500/20 cursor-pointer hover:border-cyan-400/40 transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-cyan-900/20 to-blue-900/20">
                {item.image && !imageErrors.has(item.id) ? (
                  <Image
                    src={item.image}
                    alt={title}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized={item.image.startsWith('http')}
                    onError={() => {
                      setImageErrors((prev) => new Set(prev).add(item.id))
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    {item.image && imageErrors.has(item.id) && (
                      <span className="text-cyan-400/50 text-xs">Görsel yüklenemedi</span>
                    )}
                  </div>
                )}
                <motion.div
                  className="absolute inset-0 bg-cyan-500/0"
                  whileHover={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="p-4 sm:p-5 md:p-6">
                {item.category && (
                  <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-2 block">
                    {item.category}
                  </span>
                )}
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  {title}
                </h3>
                <p className="text-sm sm:text-base text-neutral-300 mb-3 sm:mb-4 leading-relaxed">
                  {description}
                </p>
                {item.technologies && item.technologies.length > 0 && (
                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm font-semibold text-neutral-200 mb-2">
                      {messages.technologies}:
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {item.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 sm:px-3 py-1 text-xs font-medium bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors flex items-center gap-2 min-h-[44px]">
                  {messages.viewProject}
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          </Link>
        ) : (
          <motion.div
            className="group bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-cyan-500/20 cursor-pointer hover:border-cyan-400/40 transition-all touch-manipulation"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-cyan-900/20 to-blue-900/20">
              {item.image && !imageErrors.has(item.id) ? (
                <Image
                  src={item.image}
                  alt={title}
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized={item.image.startsWith('http')}
                  onError={() => {
                    setImageErrors((prev) => new Set(prev).add(item.id))
                  }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  {item.image && imageErrors.has(item.id) && (
                    <span className="text-cyan-400/50 text-xs">Görsel yüklenemedi</span>
                  )}
                </div>
              )}
              <motion.div
                className="absolute inset-0 bg-cyan-500/0"
                whileHover={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="p-4 sm:p-5 md:p-6">
              {item.category && (
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-2 block">
                  {item.category}
                </span>
              )}
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                {title}
              </h3>
              <p className="text-sm sm:text-base text-neutral-300 mb-3 sm:mb-4 leading-relaxed">
                {description}
              </p>
              {item.technologies && item.technologies.length > 0 && (
                <div className="mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm font-semibold text-neutral-200 mb-2">
                    {messages.technologies}:
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {item.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 sm:px-3 py-1 text-xs font-medium bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-cyan-400 font-semibold flex items-center gap-2 min-h-[44px]">
                {messages.viewProject}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </motion.div>
        )
        
        return (
          <StaggerItem key={item.id}>
            {content}
          </StaggerItem>
        )
      })}
    </StaggerContainer>
  )
}