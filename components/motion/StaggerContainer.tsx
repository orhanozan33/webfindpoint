'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { staggerContainer } from '@/lib/motion/variants'
import { withReducedMotion } from '@/lib/motion/reducedMotion'
import { useReducedMotion } from '@/lib/motion/reducedMotion'

interface StaggerContainerProps {
  children: ReactNode
  className?: string
}

export function StaggerContainer({ children, className }: StaggerContainerProps) {
  const prefersReducedMotion = useReducedMotion()
  const variants = withReducedMotion(staggerContainer)

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}