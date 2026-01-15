'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function AnimatedLink({ href, children, className = '', onClick }: AnimatedLinkProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={href}
        className={className}
        onClick={onClick}
      >
        {children}
      </Link>
    </motion.div>
  )
}
