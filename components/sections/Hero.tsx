'use client'

import { AnimatedButton } from '@/components/ui/AnimatedButton'
import { type Locale } from '@/lib/i18n'
import { MotionWrapper } from '@/components/motion/MotionWrapper'
import { motion } from 'framer-motion'
import { slideUp } from '@/lib/motion/variants'
import { useEffect, useRef } from 'react'
import { createFloatingMotion, cleanupGSAPAnimation } from '@/lib/motion/gsapLoops'
import { useReducedMotion } from '@/lib/motion/reducedMotion'
// import { TypingAnimation } from '@/components/motion/TypingAnimation' // Disabled for performance

interface HeroProps {
  messages: {
    title: string
    subtitle: string
    ctaPrimary: string
    ctaSecondary: string
  }
  locale: Locale
}

export function Hero({ messages, locale }: HeroProps) {
  const backgroundRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<gsap.core.Tween | null>(null)
  const prefersReducedMotion = useReducedMotion()

  // Subtle infinite background motion (GSAP)
  useEffect(() => {
    if (prefersReducedMotion || !backgroundRef.current) return

    const anim = createFloatingMotion(backgroundRef.current, {
      speed: 30,
      distance: 20,
      axis: 'both',
    })
    animationRef.current = anim

    return () => {
      if (animationRef.current) {
        cleanupGSAPAnimation(animationRef.current)
      }
    }
  }, [prefersReducedMotion])

  return (
    <section className="relative py-8 sm:py-16 md:py-24 lg:py-32 xl:py-36 overflow-hidden">
      {/* Glow effect behind content */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 via-transparent to-neon-blue/10 pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline - Fade + Slide Up with glow + Typing animation (Anant Jain style) */}
          <MotionWrapper variants={slideUp} animateOnMount delay={0.2}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 sm:mb-6 leading-tight px-2">
              <span className="bg-gradient-to-r from-white via-neon-cyan to-neon-blue bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                {/* Typing animation disabled for better performance - can be re-enabled if needed */}
                {messages.title}
                {/* <TypingAnimation 
                  text={messages.title} 
                  speed={80}
                /> */}
              </span>
            </h1>
          </MotionWrapper>
          
          {/* Subtitle - Fade + Slide Up */}
          <MotionWrapper variants={slideUp} animateOnMount delay={0.4}>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-300 mb-4 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
              {messages.subtitle}
            </p>
          </MotionWrapper>
          
          {/* CTA Buttons - Fade + Slide Up with Pulse */}
          <MotionWrapper variants={slideUp} animateOnMount delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <AnimatedButton 
                href={`/${locale}/contact`} 
                variant="primary" 
                size="lg"
                pulse={true}
                className="min-h-[44px] touch-manipulation"
              >
                {messages.ctaPrimary}
              </AnimatedButton>
              <AnimatedButton 
                href={`/${locale}/portfolio`} 
                variant="outline" 
                size="lg"
                className="min-h-[44px] touch-manipulation"
              >
                {messages.ctaSecondary}
              </AnimatedButton>
            </div>
          </MotionWrapper>
        </div>
      </div>
    </section>
  )
}