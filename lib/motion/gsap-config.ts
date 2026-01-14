'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion, getOptimalDuration } from './utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
  
  // Production optimizations
  gsap.config({
    nullTargetWarn: false,
  })
  
  // Use will-change for better performance
  gsap.set('.gsap-animate', { willChange: 'transform, opacity' })
  
  // CRITICAL: Ensure ScrollTrigger does NOT hijack scrolling
  // ScrollTrigger only triggers animations, never controls scroll position
  // By default, ScrollTrigger does NOT prevent default scroll behavior
  // We ensure this by not using any scroll-locking features in our animations
}

// ============================================
// SCROLL-BASED ANIMATIONS
// ============================================

export const fadeInOnScroll = (
  element: string | Element,
  delay: number = 0
): gsap.core.Tween | null => {
  if (prefersReducedMotion()) {
    // Simple fade for reduced motion
    return gsap.fromTo(
      element,
      { opacity: 0 },
      {
        opacity: 1,
        duration: getOptimalDuration(0.3),
        delay,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    )
  }

  return gsap.fromTo(
    element,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: getOptimalDuration(1),
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    }
  )
}

export const staggerFadeIn = (
  elements: string | Element[],
  delay: number = 0.1
): gsap.core.Tween | null => {
  if (prefersReducedMotion()) {
    return gsap.fromTo(
      elements,
      { opacity: 0 },
      {
        opacity: 1,
        duration: getOptimalDuration(0.3),
        stagger: delay * 0.5, // Faster for reduced motion
        ease: 'power1.out',
        scrollTrigger: {
          trigger: Array.isArray(elements) ? elements[0] : elements,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    )
  }

  return gsap.fromTo(
    elements,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: getOptimalDuration(0.8),
      stagger: delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: Array.isArray(elements) ? elements[0] : elements,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    }
  )
}

// ============================================
// PERFORMANCE HELPERS
// ============================================

/**
 * Batch DOM reads/writes for better performance
 */
export const batchGSAPAnimations = (
  animations: (() => gsap.core.Tween | null)[]
): gsap.core.Tween[] => {
  const results: gsap.core.Tween[] = []
  
  // Use requestAnimationFrame to batch
  requestAnimationFrame(() => {
    animations.forEach((anim) => {
      const result = anim()
      if (result) results.push(result)
    })
  })
  
  return results
}