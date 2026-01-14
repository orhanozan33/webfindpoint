'use client'

/**
 * Production-ready GSAP infinite loop animations
 * Safe for Next.js SSR, properly cleaned up
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion, shouldDisableAnimations } from './reducedMotion'

// Register ScrollTrigger (safe for SSR)
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
  
  // Production optimizations
  gsap.config({
    nullTargetWarn: false,
  })
}

// ============================================
// 1. HORIZONTAL INFINITE LOGO CAROUSEL
// ============================================

export interface CarouselConfig {
  speed?: number
  direction?: 'left' | 'right'
  pauseOnHover?: boolean
}

/**
 * Create seamless infinite horizontal carousel
 * 
 * @param container - Container element or selector
 * @param config - Carousel configuration
 * @returns GSAP timeline (null if reduced motion)
 */
export const createInfiniteCarousel = (
  container: HTMLElement | string,
  config: CarouselConfig = {}
): gsap.core.Timeline | null => {
  if (shouldDisableAnimations()) return null

  const {
    speed = 50,
    direction = 'left',
    pauseOnHover = true,
  } = config

  const element = typeof container === 'string' 
    ? document.querySelector(container) as HTMLElement
    : container

  if (!element) return null

  const content = element.querySelector('.carousel-content') as HTMLElement
  if (!content) return null

  // Get content width (assuming duplicated content)
  const firstChild = content.firstElementChild as HTMLElement
  if (!firstChild) return null

  const itemWidth = firstChild.offsetWidth
  const gap = parseInt(getComputedStyle(content).gap) || 0
  const itemWithGap = itemWidth + gap
  const totalItems = content.children.length
  const contentWidth = (itemWithGap * totalItems) / 2 // Divide by 2 for seamless loop

  // Create seamless infinite loop
  const tl = gsap.timeline({ 
    repeat: -1, 
    ease: 'none',
  })
  
  const moveAmount = direction === 'left' ? -contentWidth : contentWidth
  
  tl.to(content, {
    x: moveAmount,
    duration: speed,
    ease: 'none',
    modifiers: {
      x: gsap.utils.unitize((value) => {
        const num = parseFloat(value)
        // Reset position for seamless loop
        if (direction === 'left' && num <= -contentWidth) {
          return '0px'
        }
        if (direction === 'right' && num >= contentWidth) {
          return '0px'
        }
        return value
      }),
    },
  })

  // Pause on hover
  if (pauseOnHover) {
    const pause = () => tl.pause()
    const resume = () => tl.resume()
    
    element.addEventListener('mouseenter', pause)
    element.addEventListener('mouseleave', resume)
    
    // Store cleanup function
    ;(element as any)._carouselCleanup = () => {
      element.removeEventListener('mouseenter', pause)
      element.removeEventListener('mouseleave', resume)
    }
  }

  return tl
}

// ============================================
// 2. SLOW BACKGROUND FLOATING MOTION
// ============================================

export interface FloatingConfig {
  speed?: number
  distance?: number
  axis?: 'x' | 'y' | 'both'
}

/**
 * Create slow continuous floating/background motion
 * 
 * @param element - Element to animate
 * @param config - Floating configuration
 * @returns GSAP tween (null if reduced motion)
 */
export const createFloatingMotion = (
  element: HTMLElement | string,
  config: FloatingConfig = {}
): gsap.core.Tween | null => {
  if (shouldDisableAnimations()) return null

  const {
    speed = 20,
    distance = 50,
    axis = 'both',
  } = config

  const el = typeof element === 'string' 
    ? document.querySelector(element) as HTMLElement
    : element

  if (!el) return null

  // Create floating animation
  const animations: gsap.core.Tween[] = []

  if (axis === 'x' || axis === 'both') {
    const xAnim = gsap.to(el, {
      x: distance,
      duration: speed,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
    animations.push(xAnim)
  }

  if (axis === 'y' || axis === 'both') {
    const yAnim = gsap.to(el, {
      y: -distance,
      duration: speed,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
    animations.push(yAnim)
  }

  // Return combined animation (for cleanup)
  return animations[0] || null
}

// ============================================
// 3. SEAMLESS LOOPING UTILITY
// ============================================

/**
 * Create seamless loop with no visible jump
 * Duplicates content automatically
 */
export const setupSeamlessLoop = (
  container: HTMLElement,
  contentSelector: string = '.loop-content'
): void => {
  const content = container.querySelector(contentSelector) as HTMLElement
  if (!content) return

  // Check if already duplicated
  if (content.dataset.duplicated === 'true') return

  // Clone content for seamless loop
  const clone = content.cloneNode(true) as HTMLElement
  clone.classList.add('loop-clone')
  content.parentElement?.appendChild(clone)

  // Mark as duplicated
  content.dataset.duplicated = 'true'
}

// ============================================
// 4. CLEANUP UTILITIES
// ============================================

/**
 * Clean up GSAP animations properly
 * Prevents memory leaks
 */
export const cleanupGSAPAnimation = (animation: gsap.core.Tween | gsap.core.Timeline | null): void => {
  if (!animation) return
  
  if ('kill' in animation) {
    animation.kill()
  }
  
  // Clean up ScrollTrigger if attached
  if ('vars' in animation && animation.vars?.scrollTrigger) {
    const st = animation.vars.scrollTrigger as ScrollTrigger
    st.kill()
  }
}

/**
 * Clean up carousel with event listeners
 */
export const cleanupCarousel = (container: HTMLElement | string, timeline: gsap.core.Timeline | null): void => {
  if (!timeline) return

  const element = typeof container === 'string' 
    ? document.querySelector(container) as HTMLElement
    : container

  if (!element) return

  // Run custom cleanup if exists
  if ((element as any)._carouselCleanup) {
    ;(element as any)._carouselCleanup()
  }

  // Kill timeline
  timeline.kill()
}

// ============================================
// 5. PARALLAX SCROLL (Optional)
// ============================================

/**
 * Create slow parallax scroll effect
 */
export const createParallaxScroll = (
  element: HTMLElement | string,
  speed: number = 0.5,
  trigger?: HTMLElement | string
): gsap.core.Tween | null => {
  if (shouldDisableAnimations()) return null

  const el = typeof element === 'string' 
    ? document.querySelector(element) as HTMLElement
    : element

  if (!el) return null

  const triggerEl = trigger 
    ? (typeof trigger === 'string' ? document.querySelector(trigger) as HTMLElement : trigger)
    : el

  return gsap.to(el, {
    y: speed * 100,
    ease: 'none',
    scrollTrigger: {
      trigger: triggerEl,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  } as any)
}