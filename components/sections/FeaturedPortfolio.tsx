'use client'

import { type Locale } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { StaggerContainer } from '@/components/motion/StaggerContainer'
import { StaggerItem } from '@/components/motion/StaggerItem'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { motion } from 'framer-motion'
import { hoverScale } from '@/lib/motion/variants'

interface FeaturedPortfolioProps {
  messages: {
    title: string
    subtitle: string
    viewAll: string
  }
  locale: Locale
}

// Featured projects - in production, fetch from database
const featuredProjects = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    description: 'Modern e-commerce solution with seamless checkout experience.',
    image: '/api/placeholder/600/400',
  },
  {
    id: 2,
    title: 'Corporate Website',
    description: 'Professional corporate website with CMS integration.',
    image: '/api/placeholder/600/400',
  },
  {
    id: 3,
    title: 'SaaS Dashboard',
    description: 'Analytics dashboard with real-time data visualization.',
    image: '/api/placeholder/600/400',
  },
]

export function FeaturedPortfolio({ messages, locale }: FeaturedPortfolioProps) {
  return (
    <section className="py-20 md:py-32 bg-neutral-50">
      <div className="container mx-auto px-4">
        <ScrollReveal className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            {messages.title}
          </h2>
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto">
            {messages.subtitle}
          </p>
        </ScrollReveal>
        
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {featuredProjects.map((project) => (
            <StaggerItem key={project.id}>
              <motion.div
                className="group bg-white rounded-xl overflow-hidden shadow-md border border-neutral-200 cursor-pointer"
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="aspect-video bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-primary-600/0"
                    whileHover={{ backgroundColor: 'rgba(14, 165, 233, 0.1)' }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    className="absolute inset-0"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
        
        <ScrollReveal className="text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button href={`/${locale}/portfolio`} variant="outline" size="lg">
              {messages.viewAll}
            </Button>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  )
}