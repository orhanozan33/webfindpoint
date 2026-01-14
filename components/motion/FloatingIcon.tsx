'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { floating } from '@/lib/motion/variants'
import { useReducedMotion } from '@/lib/motion/reducedMotion'

interface FloatingIconProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function FloatingIcon({ children, className, delay = 0 }: FloatingIconProps) {
  const prefersReducedMotion = useReducedMotion()
  
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
      }}
      transition={{ delay, duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}