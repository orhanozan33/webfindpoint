'use client'

import { StaggerContainer } from '@/components/motion/StaggerContainer'
import { StaggerItem } from '@/components/motion/StaggerItem'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { HoverLift } from '@/components/motion/HoverLift'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/motion/reducedMotion'

interface ServicesProps {
  messages: {
    title: string
    subtitle: string
    webDesign: { title: string; description: string }
    uiux: { title: string; description: string }
    development: { title: string; description: string }
    optimization: { title: string; description: string }
  }
}

export function Services({ messages }: ServicesProps) {
  const prefersReducedMotion = useReducedMotion()
  
  const services = [
    { ...messages.webDesign, icon: '🎨' },
    { ...messages.uiux, icon: '✨' },
    { ...messages.development, icon: '⚡' },
    { ...messages.optimization, icon: '🚀' },
  ]

  return (
    <section className="py-12 sm:py-16 md:py-24 lg:py-32 relative" id="services">
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
          {services.map((service, index) => (
            <StaggerItem key={index}>
              <HoverLift
                className="p-4 sm:p-5 md:p-6 rounded-xl bg-dark-surface/50 backdrop-blur-md border border-dark-border cursor-pointer h-full flex flex-col hover:border-neon-cyan/50 hover:shadow-lg hover:shadow-neon-cyan/20 transition-all touch-manipulation"
                liftAmount={8}
                scaleAmount={1.05}
              >
                {/* Looping icon animation (subtle) */}
                <motion.div 
                  className="text-3xl sm:text-4xl mb-3 sm:mb-4"
                  animate={prefersReducedMotion ? {} : { 
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={prefersReducedMotion ? {} : {
                    duration: 4,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: 'easeInOut'
                  }}
                >
                  {service.icon}
                </motion.div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                  {service.title}
                </h3>
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed flex-grow">
                  {service.description}
                </p>
              </HoverLift>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}