'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PageTransitionProps {
  children: React.ReactNode
}

const pageVariants = {
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
      ease: [0.22, 1, 0.36, 1], // Custom easing for smooth feel
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

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [isTransitioning, setIsTransitioning] = useState(false)

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

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
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
