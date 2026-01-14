'use client'

import { motion, MotionProps, Variants } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'
import { useReducedMotion, withReducedMotion } from '@/lib/motion/reducedMotion'
import { fadeIn } from '@/lib/motion/variants'

interface MotionWrapperProps extends Omit<MotionProps, 'variants'> {
  children: ReactNode
  variants?: Variants
  className?: string
  delay?: number
  viewport?: { once?: boolean; amount?: number }
  animateOnMount?: boolean
}

/**
 * Production-ready MotionWrapper component
 * Handles reduced motion, viewport detection, and delays
 * SSR-safe: Prevents hydration mismatches
 */
export function MotionWrapper({ 
  children, 
  variants = fadeIn, 
  className = '',
  delay = 0,
  viewport = { once: true, amount: 0.2 },
  animateOnMount = false,
  ...props 
}: MotionWrapperProps) {
  const prefersReducedMotion = useReducedMotion()
  const [isMounted, setIsMounted] = useState(false)
  const finalVariants = withReducedMotion(variants)

  // Ensure component is mounted on client before animating (SSR-safe)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Add delay to transition if provided
  const variantsWithDelay = delay > 0 ? {
    ...finalVariants,
    visible: {
      ...finalVariants.visible,
      transition: {
        ...(finalVariants.visible as any)?.transition,
        delay,
      },
    },
  } : finalVariants

  // SSR-safe: Use consistent initial state for both SSR and client
  // Suppress hydration warning for style prop (Framer Motion handles this internally)
  if (animateOnMount) {
    return (
      <motion.div
        variants={variantsWithDelay}
        initial="hidden"
        animate={isMounted ? "visible" : "hidden"}
        className={className}
        suppressHydrationWarning
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  // For viewport-based animations, use consistent initial state
  return (
    <motion.div
      variants={variantsWithDelay}
      initial="hidden"
      whileInView={isMounted ? "visible" : "hidden"}
      viewport={viewport}
      className={className}
      suppressHydrationWarning
      {...props}
    >
      {children}
    </motion.div>
  )
}