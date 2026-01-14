'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, ReactNode } from 'react'
import { slideUp } from '@/lib/motion/variants'
import { useReducedMotion, withReducedMotion } from '@/lib/motion/reducedMotion'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  threshold?: number
}

export function ScrollReveal({ 
  children, 
  className,
  delay = 0,
  threshold = 0.1
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: threshold })
  const prefersReducedMotion = useReducedMotion()
  
  const variants = withReducedMotion(slideUp)

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}