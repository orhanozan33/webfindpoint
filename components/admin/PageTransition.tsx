'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PageTransitionProps {
  children: React.ReactNode
}

// Mobile variants - faster, subtle
const mobileVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
      opacity: { duration: 0.3 },
      y: { duration: 0.4 },
      scale: { duration: 0.4 },
      filter: { duration: 0.3 },
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    filter: 'blur(2px)',
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

// Desktop variants - more dramatic, smooth, elegant
const desktopVariants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.96,
    filter: 'blur(8px)',
    x: 0,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1], // More elegant easing for desktop
      opacity: { duration: 0.4, delay: 0.1 },
      y: { duration: 0.6 },
      scale: { duration: 0.6 },
      filter: { duration: 0.4 },
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.96,
    filter: 'blur(4px)',
    x: 0,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    // Check if desktop on mount and resize
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768) // md breakpoint
    }
    
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  useEffect(() => {
    // Start transition
    setIsTransitioning(true)
    
    // Update children when pathname changes
    const timer = setTimeout(() => {
      setDisplayChildren(children)
      setIsTransitioning(false)
    }, 50)

    return () => clearTimeout(timer)
  }, [pathname, children])

  // Use desktop variants for desktop, mobile variants for mobile
  const variants = isDesktop ? desktopVariants : mobileVariants

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        className="w-full"
        style={{
          willChange: isTransitioning ? 'transform, opacity, filter' : 'auto',
        }}
      >
        {displayChildren}
      </motion.div>
    </AnimatePresence>
  )
}
