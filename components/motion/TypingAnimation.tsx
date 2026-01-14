'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/motion/reducedMotion'

interface TypingAnimationProps {
  text: string
  speed?: number
  className?: string
  onComplete?: () => void
}

/**
 * TypingAnimation - Anant Jain style typing effect
 * 
 * Features:
 * - Progressive text reveal
 * - Smooth typing animation
 * - Respects reduced-motion
 * - Customizable speed
 */
export function TypingAnimation({ 
  text, 
  speed = 50,
  className = '',
  onComplete 
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) {
      // Skip animation if reduced motion
      setDisplayedText(text)
      setIsComplete(true)
      onComplete?.()
      return
    }

    // OPTIMIZATION: Use requestAnimationFrame instead of setInterval for better performance
    let currentIndex = 0
    let lastTime = 0
    const frameInterval = speed

    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= frameInterval) {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1))
          currentIndex++
          lastTime = currentTime
        } else {
          setIsComplete(true)
          onComplete?.()
          return
        }
      }
      requestAnimationFrame(animate)
    }

    const rafId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [text, speed, prefersReducedMotion, onComplete])

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
          className="inline-block w-0.5 h-6 ml-1"
          style={{ backgroundColor: '#06b6d4' }} // Neon cyan
        />
      )}
    </span>
  )
}