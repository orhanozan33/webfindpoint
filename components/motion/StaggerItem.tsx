'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { staggerItem } from '@/lib/motion/variants'
import { withReducedMotion } from '@/lib/motion/reducedMotion'
import { useReducedMotion } from '@/lib/motion/reducedMotion'

interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion()
  const variants = withReducedMotion(staggerItem)

  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  )
}