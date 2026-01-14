'use client'

import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { StaggerContainer } from '@/components/motion/StaggerContainer'
import { StaggerItem } from '@/components/motion/StaggerItem'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/motion/variants'
import Image from 'next/image'
import { useState } from 'react'

interface ServicesDetailProps {
  messages: {
    webDesign: { title: string; description: string; features: string[]; image?: string }
    uiux: { title: string; description: string; features: string[]; image?: string }
    development: { title: string; description: string; features: string[]; image?: string }
    optimization: { title: string; description: string; features: string[]; image?: string }
  }
}

export function ServicesDetail({ messages }: ServicesDetailProps) {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  const services = [
    { ...messages.webDesign, icon: '🎨', color: 'primary', image: messages.webDesign.image },
    { ...messages.uiux, icon: '✨', color: 'purple', image: messages.uiux.image },
    { ...messages.development, icon: '⚡', color: 'blue', image: messages.development.image },
    { ...messages.optimization, icon: '🚀', color: 'green', image: messages.optimization.image },
  ]

  return (
    <StaggerContainer className="space-y-12 sm:space-y-16 md:space-y-20 lg:space-y-24">
      {services.map((service, index) => (
        <StaggerItem key={index}>
          <ScrollReveal>
            <div
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center`}
            >
              <motion.div
                className="flex-1 w-full"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeIn}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                  <span className="bg-gradient-to-r from-white via-neon-cyan to-neon-blue bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                    {service.title}
                  </span>
                </h2>
                <p className="text-base sm:text-lg text-neutral-200 mb-4 sm:mb-6 leading-relaxed opacity-90">
                  {service.description}
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      className="flex items-start gap-2 sm:gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: featureIndex * 0.1 }}
                    >
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm sm:text-base text-neutral-200">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                className="flex-1 w-full"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-cyan-900/20 via-blue-900/20 to-purple-900/20 rounded-xl shadow-lg border border-cyan-500/20">
                  {service.image && !imageErrors.has(index) ? (
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                      unoptimized={service.image.startsWith('http') || service.image.startsWith('/uploads')}
                      onError={() => {
                        setImageErrors((prev) => new Set(prev).add(index))
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <span className="text-neutral-400 text-xs sm:text-sm">Resim yükleniyor...</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </ScrollReveal>
        </StaggerItem>
      ))}
    </StaggerContainer>
  )
}