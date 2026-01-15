'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function LoadingBar() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
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
    // Start loading when pathname changes
    setLoading(true)
    setProgress(0)

    // Desktop: slower, smoother progress
    // Mobile: faster progress
    const progressIncrement = isDesktop ? 8 : 15
    const updateInterval = isDesktop ? 40 : 50
    const completeTimeout = isDesktop ? 600 : 400

    // Simulate smooth progress
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += Math.random() * progressIncrement
      if (currentProgress >= 90) {
        currentProgress = 90
        clearInterval(interval)
      }
      setProgress(currentProgress)
    }, updateInterval)

    // Complete loading after navigation
    const timeout = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 300)
    }, completeTimeout)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [pathname, isDesktop])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed top-0 left-0 z-[100] origin-left ${
            isDesktop ? 'h-1' : 'h-0.5'
          }`}
          style={{
            width: `${progress}%`,
            background: isDesktop
              ? 'linear-gradient(90deg, #3b82f6, #2563eb, #1d4ed8, #3b82f6)'
              : 'linear-gradient(90deg, #3b82f6, #2563eb, #1d4ed8)',
            backgroundSize: isDesktop ? '200% 100%' : '100% 100%',
            boxShadow: isDesktop
              ? '0 0 15px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6)'
              : '0 0 10px rgba(59, 130, 246, 0.6), 0 0 20px rgba(59, 130, 246, 0.4)',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            ...(isDesktop && {
              animation: 'shimmer 2s infinite',
            }),
          }}
        />
      )}
    </AnimatePresence>
  )
}
