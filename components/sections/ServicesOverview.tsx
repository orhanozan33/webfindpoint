'use client'

import { StaggerContainer } from '@/components/motion/StaggerContainer'
import { StaggerItem } from '@/components/motion/StaggerItem'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { HoverLift } from '@/components/motion/HoverLift'
import { motion } from 'framer-motion'

interface ServicesOverviewProps {
  messages: {
    title: string
    subtitle: string
    webDesign: { title: string; description: string }
    uiux: { title: string; description: string }
    development: { title: string; description: string }
    optimization: { title: string; description: string }
  }
}

export function ServicesOverview({ messages }: ServicesOverviewProps) {
  const services = [
    { ...messages.webDesign, icon: '🎨' },
    { ...messages.uiux, icon: '✨' },
    { ...messages.development, icon: '⚡' },
    { ...messages.optimization, icon: '🚀' },
  ]

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4">
        <ScrollReveal className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            {messages.title}
          </h2>
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto">
            {messages.subtitle}
          </p>
        </ScrollReveal>
        
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {services.map((service, index) => (
            <StaggerItem key={index}>
              <HoverLift
                className="p-6 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer"
                liftAmount={5}
                scaleAmount={1.02}
              >
                <motion.div 
                  className="text-4xl mb-4"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: 'easeInOut'
                  }}
                >
                  {service.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
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