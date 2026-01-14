'use client'

import { useEffect } from 'react'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'

/**
 * SmoothScrollProvider - Native smooth scrolling ONLY
 * 
 * CRITICAL UX RULES:
 * - NO Lenis (completely disabled to prevent scroll hijacking)
 * - NO scroll-snap (enforced in CSS)
 * - NO page-by-page jumping
 * - NO scroll hijacking
 * - Continuous natural scroll flow
 * - Native smooth scrolling only (CSS scroll-behavior: smooth)
 * - Motion never hijacks scrolling
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    // Ensure native scroll behavior - NO Lenis, NO hijacking
    if (typeof document !== 'undefined') {
      // Force native smooth scrolling
      document.documentElement.style.scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth'
      
      // CRITICAL: Ensure scroll-snap is disabled everywhere
      document.documentElement.style.scrollSnapType = 'none'
      document.body.style.scrollSnapType = 'none'
      
      // Prevent any scroll hijacking
      document.documentElement.style.overscrollBehavior = 'auto'
      document.body.style.overscrollBehavior = 'auto'
      
      // Remove any scroll-locking classes
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped')
      document.body.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped')
    }

    return () => {
      // Cleanup - ensure native scroll is restored
      if (typeof document !== 'undefined') {
        document.documentElement.style.scrollBehavior = 'smooth'
        document.documentElement.style.scrollSnapType = 'none'
        document.body.style.scrollSnapType = 'none'
      }
    }
  }, [prefersReducedMotion])

  return <>{children}</>
}