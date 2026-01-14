'use client'

/**
 * Production-ready reduced motion detection and utilities
 * Works with both Framer Motion and GSAP
 */

// ============================================
// 1. REDUCED MOTION DETECTION
// ============================================

/**
 * Check if user prefers reduced motion
 * Safe to call on server (returns false)
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Check if device is low-powered (mobile/tablet)
 */
export const isLowPowerDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
  
  const hardwareConcurrency = navigator.hardwareConcurrency || 4
  const deviceMemory = (navigator as any).deviceMemory || 4
  
  return isMobile || hardwareConcurrency < 4 || deviceMemory < 4
}

/**
 * Check if animations should be disabled
 */
export const shouldDisableAnimations = (): boolean => {
  return prefersReducedMotion() || isLowPowerDevice()
}

// ============================================
// 2. OPTIMAL DURATION CALCULATOR
// ============================================

/**
 * Get optimal animation duration based on device and preferences
 */
export const getOptimalDuration = (baseDuration: number = 0.6): number => {
  if (prefersReducedMotion()) return 0.2
  if (isLowPowerDevice()) return baseDuration * 0.7
  return baseDuration
}

// ============================================
// 3. FRAMER MOTION FALLBACK VARIANTS
// ============================================

import { Variants } from 'framer-motion'

/**
 * Create reduced motion variants (opacity only, no transforms)
 */
export const createReducedMotionVariants = (): Variants => {
  return {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: getOptimalDuration(0.3),
        ease: 'easeOut',
      },
    },
  }
}

/**
 * Wrap any variants with reduced motion fallback
 */
export const withReducedMotion = (variants: Variants): Variants => {
  if (shouldDisableAnimations()) {
    return createReducedMotionVariants()
  }
  return variants
}

// ============================================
// 4. GSAP FALLBACK CONFIG
// ============================================

/**
 * Get GSAP animation config with reduced motion support
 */
export const getGSAPConfig = (baseConfig: {
  duration?: number
  ease?: string
  y?: number
  x?: number
}) => {
  if (shouldDisableAnimations()) {
    return {
      opacity: 1,
      duration: getOptimalDuration(0.3),
      ease: 'power1.out',
      // Remove transforms for reduced motion
      y: 0,
      x: 0,
    }
  }
  
  return {
    ...baseConfig,
    duration: getOptimalDuration(baseConfig.duration || 0.6),
  }
}

// ============================================
// 5. REACT HOOK FOR REDUCED MOTION
// ============================================

import { useEffect, useState } from 'react'

/**
 * Hook to detect reduced motion preference
 * Updates reactively when user changes preference
 */
export function useReducedMotion(): boolean {
  const [shouldReduce, setShouldReduce] = useState(false)

  useEffect(() => {
    // Initial check
    setShouldReduce(shouldDisableAnimations())

    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const handleChange = () => {
      setShouldReduce(shouldDisableAnimations())
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  return shouldReduce
}

// ============================================
// 6. CSS CLASS UTILITIES
// ============================================

/**
 * Get CSS classes for reduced motion
 */
export const getReducedMotionClasses = (): string => {
  return shouldDisableAnimations() ? 'reduced-motion' : ''
}