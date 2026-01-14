'use client'

import { StaggerContainer } from '@/components/motion/StaggerContainer'
import { StaggerItem } from '@/components/motion/StaggerItem'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { createParallaxScroll } from '@/lib/motion/gsapLoops'
import { useReducedMotion } from '@/lib/motion/reducedMotion'
import Image from 'next/image'
import Link from 'next/link'

interface PortfolioProps {
  messages: {
    title: string
    subtitle: string
    viewAll: string
  }
  locale: string
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

export function Portfolio({ messages, locale }: PortfolioProps) {
  const featuredRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const [featuredProjects, setFeaturedProjects] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  // Fetch first 3 portfolio items from database
  useEffect(() => {
    async function fetchFeaturedProjects() {
      try {
        const response = await fetch('/api/portfolio')
        if (response.ok) {
          const data = await response.json()
          // Get first 3 items
          setFeaturedProjects(data.slice(0, 3))
        } else {
          console.error('Failed to fetch portfolio items')
        }
      } catch (error) {
        console.error('Error fetching portfolio items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProjects()
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

  // Optional slow horizontal motion for featured items (GSAP parallax)
  useEffect(() => {
    if (prefersReducedMotion || !featuredRef.current) return

    const items = featuredRef.current.querySelectorAll('.portfolio-item')
    items.forEach((item, index) => {
      createParallaxScroll(item as HTMLElement, 0.1 + index * 0.05, featuredRef.current!)
    })
  }, [prefersReducedMotion])

  return (
    <section className="py-20 md:py-32 relative" id="portfolio">
      <div className="container mx-auto px-4">
        <ScrollReveal className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-neon-cyan to-neon-blue bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              {messages.title}
            </span>
          </h2>
          <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto">
            {messages.subtitle}
          </p>
        </ScrollReveal>
        
        <div ref={featuredRef}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-neutral-300 text-lg">Yükleniyor...</div>
            </div>
          ) : featuredProjects.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-neutral-300 text-lg">Henüz portfolyo öğesi yok.</div>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
              {featuredProjects.map((project) => {
                const title = getLocalizedTitle(project)
                const description = getLocalizedDescription(project)
                const content = project.projectUrl ? (
                  <Link href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <motion.div
                      className="portfolio-item group bg-dark-surface/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-dark-border cursor-pointer hover:border-neon-cyan/50 hover:shadow-neon-cyan/20 transition-all"
                      whileHover={{ 
                        scale: 1.05,
                        rotateX: 2,
                        rotateY: 2,
                      }}
                      style={{ transformStyle: 'preserve-3d' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      {/* Image container with zoom effect */}
                      <div className="aspect-video bg-gradient-to-br from-neon-cyan/20 via-neon-blue/20 to-neon-purple/20 relative overflow-hidden">
                        {project.image && !imageErrors.has(project.id) ? (
                          <Image
                            src={project.image}
                            alt={title}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized={project.image.startsWith('http')}
                            onError={() => {
                              setImageErrors((prev) => new Set(prev).add(project.id))
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 via-neon-blue/20 to-neon-purple/20" />
                        )}
                        <motion.div
                          className="absolute inset-0 bg-neon-cyan/0"
                          whileHover={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      
                      <div className="p-6">
                        {project.category && (
                          <span className="text-xs font-semibold text-neon-cyan uppercase tracking-wide mb-2 block">
                            {project.category}
                          </span>
                        )}
                        <h3 className="text-xl font-bold text-white mb-2">
                          {title}
                        </h3>
                        <p className="text-neutral-300 leading-relaxed mb-4">
                          {description}
                        </p>
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 text-xs font-medium bg-dark-border/50 text-neon-cyan rounded-full border border-neon-cyan/30"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                ) : (
                  <motion.div
                    className="portfolio-item group bg-dark-surface/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-dark-border cursor-pointer hover:border-neon-cyan/50 hover:shadow-neon-cyan/20 transition-all"
                    whileHover={{ 
                      scale: 1.05,
                      rotateX: 2,
                      rotateY: 2,
                    }}
                    style={{ transformStyle: 'preserve-3d' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {/* Image container with zoom effect */}
                    <div className="aspect-video bg-gradient-to-br from-neon-cyan/20 via-neon-blue/20 to-neon-purple/20 relative overflow-hidden">
                      {project.image && !imageErrors.has(project.id) ? (
                        <Image
                          src={project.image}
                          alt={title}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized={project.image.startsWith('http')}
                          onError={() => {
                            setImageErrors((prev) => new Set(prev).add(project.id))
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 via-neon-blue/20 to-neon-purple/20" />
                      )}
                      <motion.div
                        className="absolute inset-0 bg-neon-cyan/0"
                        whileHover={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    
                    <div className="p-6">
                      {project.category && (
                        <span className="text-xs font-semibold text-neon-cyan uppercase tracking-wide mb-2 block">
                          {project.category}
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-white mb-2">
                        {title}
                      </h3>
                      <p className="text-neutral-300 leading-relaxed mb-4">
                        {description}
                      </p>
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 text-xs font-medium bg-dark-border/50 text-neon-cyan rounded-full border border-neon-cyan/30"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )

                return (
                  <StaggerItem key={project.id}>
                    {content}
                  </StaggerItem>
                )
              })}
            </StaggerContainer>
          )}
        </div>
        
        <ScrollReveal className="text-center">
          <motion.a
            href={`/${locale}/portfolio`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <button className="px-8 py-4 text-lg font-semibold border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 rounded-lg transition-colors backdrop-blur-sm">
              {messages.viewAll}
            </button>
          </motion.a>
        </ScrollReveal>
      </div>
    </section>
  )
}