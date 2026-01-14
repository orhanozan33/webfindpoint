'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/motion/reducedMotion'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  glow: number // Glow intensity
  z: number // Depth for blur effect
  baseX: number // Base position for wave effect
  baseY: number
  waveOffset: number // Wave animation offset
}

interface Ripple {
  x: number
  y: number
  radius: number
  opacity: number
  maxRadius: number
}

interface AnimatedNetworkProps {
  className?: string
}

/**
 * AnimatedNetwork - Premium network/particle background
 * 
 * Features:
 * - Dark blue background (like the reference image)
 * - White nodes with soft glow
 * - Thin white connecting lines
 * - Slow, elegant movement
 * - Depth of field effect (blur)
 * - Low CPU/GPU usage
 * - Respects reduced-motion
 */
export function AnimatedNetwork({ className = '' }: AnimatedNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const nodesRef = useRef<Node[]>([])
  const mouseRef = useRef({ x: 0, y: 0, isActive: false })
  const ripplesRef = useRef<Ripple[]>([])
  const prefersReducedMotion = useReducedMotion()
  const [isVisible, setIsVisible] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion || !canvasRef.current) {
      setIsVisible(false)
      return
    }

    // Detect mobile device
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.innerWidth <= 768 && 'ontouchstart' in window)
      setIsMobile(isMobileDevice)
      return isMobileDevice
    }
    const mobile = checkMobile()

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      // Re-check mobile on resize
      checkMobile()
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Unified pointer tracking (mouse + touch) - OPTIMIZED: Throttled
    let rafId: number | null = null
    const handlePointerMove = (x: number, y: number) => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          const prevMouse = mouseRef.current
          mouseRef.current = {
            x,
            y,
            isActive: true,
          }
          
          // Create ripple effect on pointer movement (wave effect)
          const dx = x - prevMouse.x
          const dy = y - prevMouse.y
          const speed = Math.sqrt(dx * dx + dy * dy)
          
          // Create ripple on every pointer movement (but limit total count)
          // Remove old ripples if too many
          const maxRipples = mobile ? 5 : 8
          if (ripplesRef.current.length > maxRipples) {
            ripplesRef.current = ripplesRef.current.slice(-(mobile ? 3 : 5)) // Keep last few
          }
          
          // Add ripple at pointer position
          ripplesRef.current.push({
            x,
            y,
            radius: 0,
            opacity: 0.9,
            maxRadius: mobile ? 200 : 300, // Smaller ripples on mobile
          })
          
          rafId = null
        })
      }
    }
    
    // Mouse events (desktop)
    const handleMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY)
    }
    
    const handleMouseLeave = () => {
      mouseRef.current.isActive = false
    }
    
    // Touch events (mobile)
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault() // Prevent scrolling issues
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        handlePointerMove(touch.clientX, touch.clientY)
      }
    }
    
    const handleTouchEnd = () => {
      mouseRef.current.isActive = false
    }
    
    // Add event listeners based on device type
    if (mobile) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleTouchEnd, { passive: true })
    } else {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
      window.addEventListener('mouseleave', handleMouseLeave, { passive: true })
    }

    // Create nodes - Mobile: fewer nodes for performance, Desktop: more nodes
    const baseNodeCount = mobile 
      ? Math.min(30, Math.floor((canvas.width * canvas.height) / 25000)) // Fewer nodes on mobile
      : Math.min(60, Math.floor((canvas.width * canvas.height) / 15000))
    const nodeCount = baseNodeCount
    nodesRef.current = Array.from({ length: nodeCount }, () => {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      return {
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 1 + 0.5,
        glow: Math.random() * 0.5 + 0.5,
        z: Math.random(),
        waveOffset: Math.random() * Math.PI * 2, // Random wave phase
      }
    })

    // Dark blue background color (like reference image)
    const bgColor = '#0a1628' // Deep dark blue

    // OPTIMIZATION: FPS limiter - Mobile: 20fps, Desktop: 30fps
    let lastTime = 0
    const targetFPS = mobile ? 20 : 30 // Lower FPS on mobile for better performance
    const frameInterval = 1000 / targetFPS

    // Animation loop - OPTIMIZED
    const animate = (currentTime: number) => {
      if (!ctx) return

      // FPS limiting
      const elapsed = currentTime - lastTime
      if (elapsed < frameInterval) {
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }
      lastTime = currentTime - (elapsed % frameInterval)

      // Clear with dark blue background
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const nodes = nodesRef.current
      const mouse = mouseRef.current

      // Update ripples (wave effect) - Mobile: slower, Desktop: faster
      const rippleSpeed = mobile ? 2 : 3
      const rippleFade = mobile ? 0.02 : 0.015
      ripplesRef.current = ripplesRef.current
        .map((ripple) => {
          ripple.radius += rippleSpeed
          ripple.opacity -= rippleFade
          return ripple
        })
        .filter((ripple) => ripple.radius < ripple.maxRadius && ripple.opacity > 0)

      // OPTIMIZATION: Batch node updates and drawing
      // Update positions with wave effect
      const time = currentTime * 0.001 // Convert to seconds
      
      nodes.forEach((node) => {
        // Base movement
        node.baseX += node.vx
        node.baseY += node.vy

        // Wrap around edges (continuous flow)
        if (node.baseX < 0) node.baseX = canvas.width
        if (node.baseX > canvas.width) node.baseX = 0
        if (node.baseY < 0) node.baseY = canvas.height
        if (node.baseY > canvas.height) node.baseY = 0

        // Wave effect from mouse (ripple/wave)
        let waveX = 0
        let waveY = 0
        
        if (mouse.isActive) {
          // Calculate distance from mouse
          const dx = node.baseX - mouse.x
          const dy = node.baseY - mouse.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          // Wave effect: nodes are pushed away from pointer with wave motion
          // Mobile: smaller influence radius and strength for performance
          const influenceRadius = mobile ? 200 : 300
          const maxWaveStrength = mobile ? 10 : 15
          if (distance < influenceRadius) {
            const waveStrength = (1 - distance / influenceRadius) * maxWaveStrength
            const waveAngle = Math.atan2(dy, dx) + node.waveOffset
            const waveSpeed = mobile ? 1.5 : 2 // Slower wave on mobile
            const waveTime = time * waveSpeed + node.waveOffset
            
            // Circular wave pattern
            waveX = Math.cos(waveAngle + waveTime) * waveStrength
            waveY = Math.sin(waveAngle + waveTime) * waveStrength
            
            // Add ripple effect
            ripplesRef.current.forEach((ripple) => {
              const rippleDx = node.baseX - ripple.x
              const rippleDy = node.baseY - ripple.y
              const rippleDistance = Math.sqrt(rippleDx * rippleDx + rippleDy * rippleDy)
              
              if (rippleDistance < ripple.radius && rippleDistance > ripple.radius - 30) {
                const rippleStrength = (1 - Math.abs(rippleDistance - ripple.radius) / 30) * 10
                const rippleAngle = Math.atan2(rippleDy, rippleDx)
                waveX += Math.cos(rippleAngle) * rippleStrength * ripple.opacity
                waveY += Math.sin(rippleAngle) * rippleStrength * ripple.opacity
              }
            })
          }
        }

        // Apply wave to position
        node.x = node.baseX + waveX
        node.y = node.baseY + waveY
      })

      // Draw nodes - OPTIMIZED: Removed blur filter (very expensive)
      nodes.forEach((node) => {
        // Mouse interactivity (Anant Jain style) - nodes react to mouse
        const dx = node.x - mouse.x
        const dy = node.y - mouse.y
        const mouseDistanceSq = dx * dx + dy * dy // Use squared distance (faster)
        const mouseDistance = Math.sqrt(mouseDistanceSq)
        const mouseInfluence = Math.max(0, 1 - mouseDistance / 200) // 200px influence radius
        const mouseScale = 1 + mouseInfluence * 0.3 // Reduced from 0.5
        const mouseGlow = node.glow + mouseInfluence * 0.2 // Reduced from 0.3

        // Draw glow first (larger, softer) - OPTIMIZED: Simplified gradient
        const glowRadius = Math.max(0, node.radius * (3 + mouseGlow * 1.5) * mouseScale)
        const nodeRadius = Math.max(0, node.radius * mouseScale)
        
        // Safety check: ensure radii are positive
        if (glowRadius > 0) {
          ctx.save()
          const glowGradient = ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            glowRadius
          )
          glowGradient.addColorStop(0, `rgba(255, 255, 255, ${0.2 * mouseGlow})`)
          glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
          ctx.fillStyle = glowGradient
          ctx.beginPath()
          ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }

        // Draw node (bright white) - OPTIMIZED: No blur filter
        if (nodeRadius > 0) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2)
          const nodeOpacity = Math.min(1, 0.8 - node.z * 0.2 + mouseInfluence * 0.15)
          ctx.fillStyle = `rgba(255, 255, 255, ${nodeOpacity})`
          ctx.fill()
        }
      })

      // Draw ripples (wave effect visualization) - More visible and bigger
      ripplesRef.current.forEach((ripple) => {
        // Safety check: ensure radius is positive
        if (ripple.radius <= 0) return
        
        ctx.save()
        // More visible: increased opacity from 0.3 to 0.6
        ctx.strokeStyle = `rgba(6, 182, 212, ${ripple.opacity * 0.6})` // Neon cyan - more visible
        ctx.lineWidth = 3 // Increased from 2 to 3 for thicker lines
        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
        ctx.stroke()
        
        // Add inner glow for extra visibility (only if radius is large enough)
        if (ripple.radius > 5) {
          ctx.strokeStyle = `rgba(6, 182, 212, ${ripple.opacity * 0.2})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(ripple.x, ripple.y, Math.max(0, ripple.radius - 5), 0, Math.PI * 2)
          ctx.stroke()
        }
        
        ctx.restore()
      })

      // Draw connections - OPTIMIZED: Reduced connection distance check + Wave effect
      nodes.forEach((node, i) => {
        nodes.slice(i + 1).forEach((otherNode) => {
          const dx = otherNode.x - node.x
          const dy = otherNode.y - node.y
          const distanceSq = dx * dx + dy * dy

          // Connect nodes within range - Mobile: shorter connections for performance
          const maxConnectionDistance = mobile ? 120 : 150
          if (distanceSq < maxConnectionDistance * maxConnectionDistance) {
            const distance = Math.sqrt(distanceSq)
            // More visible connections: increased opacity
            const baseOpacity = mobile ? 0.6 : 0.8 // Slightly lower opacity on mobile
            let opacity = (1 - distance / maxConnectionDistance) * baseOpacity
            
            // Calculate mouse distance for wave and color effects
            let mouseDistance = Infinity
            if (mouse.isActive) {
              const midX = (node.x + otherNode.x) / 2
              const midY = (node.y + otherNode.y) / 2
              const mouseDx = midX - mouse.x
              const mouseDy = midY - mouse.y
              mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy)
              
              // Wave effect: lines pulse near mouse
              if (mouseDistance < 200) {
                const wavePulse = Math.sin(time * 3 + mouseDistance * 0.1) * 0.15 + 0.15
                opacity += wavePulse * (1 - mouseDistance / 200)
                opacity = Math.min(1, opacity) // Cap at 1.0
              }
            }
            
            // More visible: blend white with subtle neon cyan tint
            // Closer to mouse = more cyan, farther = more white
            const cyanBlend = mouse.isActive && mouseDistance < 200 
              ? (1 - mouseDistance / 200) * 0.4 
              : 0.1
            
            const r = Math.floor(255 * (1 - cyanBlend) + 6 * cyanBlend)
            const g = Math.floor(255 * (1 - cyanBlend) + 182 * cyanBlend)
            const b = Math.floor(255 * (1 - cyanBlend) + 212 * cyanBlend)
            
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(otherNode.x, otherNode.y)
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
            ctx.lineWidth = 2 // Increased for more visible lines
            ctx.stroke()
          }
        })
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      // Remove all event listeners (both mobile and desktop, safe to call even if not added)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [prefersReducedMotion])

  if (!isVisible || prefersReducedMotion) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ 
        zIndex: 0,
        backgroundColor: '#0a1628', // Dark blue background
      }}
      aria-hidden="true"
    />
  )
}