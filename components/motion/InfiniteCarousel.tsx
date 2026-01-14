'use client'

import { useEffect, useRef } from 'react'
import { createInfiniteCarousel, cleanupCarousel } from '@/lib/motion/gsapLoops'
import { setupSeamlessLoop } from '@/lib/motion/gsapLoops'
import { useReducedMotion } from '@/lib/motion/reducedMotion'

interface InfiniteCarouselProps {
  children: React.ReactNode
  speed?: number
  direction?: 'left' | 'right'
  className?: string
  pauseOnHover?: boolean
}

export function InfiniteCarousel({
  children,
  speed = 50,
  direction = 'left',
  className = '',
  pauseOnHover = true,
}: InfiniteCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<gsap.core.Timeline | null>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return

    // Setup seamless loop (duplicates content)
    setupSeamlessLoop(containerRef.current)

    // Create animation
    const anim = createInfiniteCarousel(containerRef.current, {
      speed,
      direction,
      pauseOnHover,
    })
    animationRef.current = anim

    return () => {
      if (animationRef.current && containerRef.current) {
        cleanupCarousel(containerRef.current, animationRef.current)
      }
    }
  }, [speed, direction, pauseOnHover, prefersReducedMotion])

  if (prefersReducedMotion) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <div className="flex gap-12 items-center">{children}</div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div
        ref={contentRef}
        className="carousel-content flex gap-12 items-center will-change-transform"
      >
        {children}
      </div>
    </div>
  )
}