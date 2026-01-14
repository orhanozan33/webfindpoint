'use client'

import { useEffect, useState } from 'react'
import { prefersReducedMotion as checkReducedMotion, isLowPowerDevice } from './utils'

/**
 * Hook to detect if user prefers reduced motion
 * Also checks for low-power devices
 */
export function useReducedMotion() {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false)

  useEffect(() => {
    // Check on mount
    const reduced = checkReducedMotion() || isLowPowerDevice()
    setShouldReduceMotion(reduced)

    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches || isLowPowerDevice())
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return shouldReduceMotion
}