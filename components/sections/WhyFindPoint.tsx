'use client'

import { StaggerContainer } from '@/components/motion/StaggerContainer'
import { StaggerItem } from '@/components/motion/StaggerItem'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { FloatingIcon } from '@/components/motion/FloatingIcon'
import { motion } from 'framer-motion'
import { hoverLift } from '@/lib/motion/variants'

interface WhyFindPointProps {
  messages: {
    title: string
    subtitle: string
    canada: { title: string; description: string }
    fast: { title: string; description: string }
    modern: { title: string; description: string }
    clientFocused: { title: string; description: string }
  }
}

export function WhyFindPoint({ messages }: WhyFindPointProps) {
  const features = [
    { ...messages.canada, icon: '🇨🇦', delay: 0 },
    { ...messages.fast, icon: '⚡', delay: 0.5 },
    { ...messages.modern, icon: '🚀', delay: 1 },
    { ...messages.clientFocused, icon: '💼', delay: 1.5 },
  ]

  return (
    <section className="py-12 sm:py-16 md:py-24 lg:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6">
        <ScrollReveal className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">
            <span className="bg-gradient-to-r from-white via-neon-cyan to-neon-blue bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              {messages.title}
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-neutral-300 max-w-2xl mx-auto px-4">
            {messages.subtitle}
          </p>
        </ScrollReveal>
        
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, index) => (
            <StaggerItem key={index}>
              <motion.div
                className="text-center p-4 sm:p-5 md:p-6 rounded-xl bg-dark-surface/50 backdrop-blur-md border border-dark-border cursor-pointer hover:border-neon-cyan/50 hover:shadow-lg hover:shadow-neon-cyan/20 transition-all touch-manipulation"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <FloatingIcon delay={feature.delay}>
                  <div className="text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4 flex items-center justify-center">
                    {feature.icon === '🇨🇦' ? '🇨🇦' : feature.icon}
                  </div>
                </FloatingIcon>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}