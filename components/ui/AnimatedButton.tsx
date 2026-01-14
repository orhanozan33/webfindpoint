'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { buttonPulse } from '@/lib/motion/variants'
import { useReducedMotion, withReducedMotion } from '@/lib/motion/reducedMotion'
import Link from 'next/link'

interface AnimatedButtonProps {
  children: ReactNode
  href?: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  pulse?: boolean
}

/**
 * Production-ready animated button with pulse effect
 * Respects reduced motion preferences
 */
export function AnimatedButton({
  children,
  href,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  className = '',
  pulse = false,
}: AnimatedButtonProps) {
  const prefersReducedMotion = useReducedMotion()
  
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 touch-manipulation'
  
  const variants = {
    primary: 'bg-gradient-to-r from-neon-cyan to-neon-blue text-white hover:from-neon-blue hover:to-neon-cyan focus:ring-neon-cyan shadow-lg shadow-neon-cyan/50 hover:shadow-neon-cyan/70 transition-all',
    secondary: 'bg-dark-surface text-neutral-200 hover:bg-dark-border border border-dark-border focus:ring-neon-cyan',
    outline: 'border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 focus:ring-neon-cyan backdrop-blur-sm',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[40px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg min-h-[48px] sm:min-h-[52px]',
  }

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`

  // Pulse animation (subtle infinite)
  const pulseVariants = pulse && !prefersReducedMotion 
    ? withReducedMotion(buttonPulse)
    : undefined

  const buttonContent = (
    <motion.div
      variants={pulseVariants}
      animate={pulseVariants ? 'animate' : undefined}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  )

  if (href) {
    return (
      <Link href={href} className={classes}>
        {buttonContent}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {buttonContent}
    </button>
  )
}