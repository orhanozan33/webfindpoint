'use client'

import { motion, MotionProps } from 'framer-motion'
import { ReactNode } from 'react'
import { fadeIn } from '@/lib/motion/variants'
import { useReducedMotion } from '@/lib/motion/reducedMotion'

interface FadeInProps extends Omit<MotionProps, 'variants' | 'initial' | 'animate'> {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
  viewport?: { once?: boolean; amount?: number }
}

/**
 * Production-ready FadeIn component
 * Automatically handles reduced motion
 */
export function FadeIn({
  children,
  delay = 0,
  duration,
  className = '',
  viewport = { once: true, amount: 0.2 },
  ...props
}: FadeInProps) {
  const prefersReducedMotion = useReducedMotion()
  
  const customVariants = {
    hidden: fadeIn.hidden,
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: duration || 0.5,
        delay,
        ease: 'easeOut',
      },
    },
  }

  const variants = prefersReducedMotion
    ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      }
    : customVariants

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}