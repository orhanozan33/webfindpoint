'use client'

import { useEffect, useRef, forwardRef } from 'react'
import { createFloatingMotion, cleanupGSAPAnimation } from '@/lib/motion/gsapLoops'
import { useReducedMotion } from '@/lib/motion/reducedMotion'

interface BackgroundLoopProps {
  children: React.ReactNode
  speed?: number
  axis?: 'x' | 'y' | 'both'
  className?: string
}

export const BackgroundLoop = forwardRef<HTMLDivElement, BackgroundLoopProps>(
  function BackgroundLoop(
    {
      children,
      speed = 20,
      axis = 'x',
      className = '',
    },
    ref
  ) {
    const internalRef = useRef<HTMLDivElement>(null)
    const elementRef = (ref as React.RefObject<HTMLDivElement>) || internalRef
    const animationRef = useRef<gsap.core.Tween | null>(null)
    const prefersReducedMotion = useReducedMotion()

    useEffect(() => {
      if (prefersReducedMotion || !elementRef.current) return

      const anim = createFloatingMotion(elementRef.current, {
        speed,
        axis,
      })
      animationRef.current = anim

      return () => {
        if (animationRef.current) {
          cleanupGSAPAnimation(animationRef.current)
        }
      }
    }, [speed, axis, prefersReducedMotion])

    return (
      <div
        ref={elementRef}
        className={`will-change-transform ${className}`}
      >
        {children}
      </div>
    )
  }
)