'use client'

/**
 * Check if user prefers reduced motion
 * Safe to call on server (returns false)
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Check if device is low-powered (mobile)
 */
export const isLowPowerDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  
  // Check for mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
  
  // Check for low-end device indicators
  const hardwareConcurrency = navigator.hardwareConcurrency || 4
  const deviceMemory = (navigator as any).deviceMemory || 4
  
  return isMobile || hardwareConcurrency < 4 || deviceMemory < 4
}

/**
 * Get optimal animation duration based on device
 */
export const getOptimalDuration = (baseDuration: number = 0.6): number => {
  if (prefersReducedMotion()) return 0.2
  if (isLowPowerDevice()) return baseDuration * 0.7
  return baseDuration
}

/**
 * Check if animations should be disabled
 */
export const shouldDisableAnimations = (): boolean => {
  return prefersReducedMotion() || isLowPowerDevice()
}