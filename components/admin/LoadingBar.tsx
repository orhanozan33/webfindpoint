'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function LoadingBar() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Start loading when pathname changes
    setLoading(true)
    setProgress(0)

    // Simulate smooth progress
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15
      if (currentProgress >= 90) {
        currentProgress = 90
        clearInterval(interval)
      }
      setProgress(currentProgress)
    }, 50)

    // Complete loading after navigation
    const timeout = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 300)
    }, 400)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [pathname])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 z-[100] h-0.5 origin-left"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #3b82f6, #2563eb, #1d4ed8)',
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.6), 0 0 20px rgba(59, 130, 246, 0.4)',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      )}
    </AnimatePresence>
  )
}
