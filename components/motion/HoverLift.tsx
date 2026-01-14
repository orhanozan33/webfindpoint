'use client'

import { motion, MotionProps } from 'framer-motion'
import { ReactNode } from 'react'
import { hoverLift } from '@/lib/motion/variants'
import { useReducedMotion, withReducedMotion } from '@/lib/motion/reducedMotion'

interface HoverLiftProps extends Omit<MotionProps, 'variants' | 'initial' | 'whileHover'> {
  children: ReactNode
  className?: string
  liftAmount?: number
  scaleAmount?: number
}

/**
 * Production-ready HoverLift component
 * Subtle lift effect on hover, respects reduced motion
 */
export function HoverLift({
  children,
  className = '',
  liftAmount = 5,
  scaleAmount = 1.02,
  ...props
}: HoverLiftProps) {
  const prefersReducedMotion = useReducedMotion()
  
  // Custom hover variants with configurable amounts + 3D tilt (Anant Jain style)
  const customHoverLift = withReducedMotion({
    rest: {
      scale: 1,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    hover: {
      scale: scaleAmount,
      y: -liftAmount,
      rotateX: 2, // Subtle 3D tilt
      rotateY: 2,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  })

  // If reduced motion, disable hover effects
  if (prefersReducedMotion) {
    return (
      <div className={className} {...(props as any)}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      variants={customHoverLift}
      initial="rest"
      whileHover="hover"
      style={{ transformStyle: 'preserve-3d' }} // Enable 3D transforms
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}