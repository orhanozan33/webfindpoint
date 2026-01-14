'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// ============================================
// 1. HORIZONTAL LOGO CAROUSEL (Infinite Loop)
// ============================================
export const createInfiniteCarousel = (
  container: HTMLElement | string,
  speed: number = 50,
  direction: 'left' | 'right' = 'left'
): gsap.core.Timeline | null => {
  if (prefersReducedMotion()) return null

  const element = typeof container === 'string' 
    ? document.querySelector(container) as HTMLElement
    : container

  if (!element) return null

  const content = element.querySelector('.carousel-content') as HTMLElement
  if (!content) return null

  // Get content width
  const contentWidth = content.scrollWidth / 2 // Divide by 2 because we duplicate

  // Create seamless loop
  const tl = gsap.timeline({ repeat: -1, ease: 'none' })
  
  const moveAmount = direction === 'left' ? -contentWidth : contentWidth
  
  tl.to(content, {
    x: moveAmount,
    duration: speed,
    ease: 'none',
  })

  // Pause on hover
  element.addEventListener('mouseenter', () => tl.pause())
  element.addEventListener('mouseleave', () => tl.resume())

  return tl
}

// ============================================
// 2. CONTINUOUS BACKGROUND MOVEMENT
// ============================================
export const createBackgroundLoop = (
  element: HTMLElement | string,
  speed: number = 20,
  axis: 'x' | 'y' = 'x'
): gsap.core.Tween | null => {
  if (prefersReducedMotion()) return null

  const el = typeof element === 'string' 
    ? document.querySelector(element) as HTMLElement
    : element

  if (!el) return null

  const property = axis === 'x' ? 'x' : 'y'
  const moveAmount = axis === 'x' ? -100 : -100

  return gsap.to(el, {
    [property]: moveAmount,
    duration: speed,
    repeat: -1,
    ease: 'none',
    modifiers: {
      [property]: gsap.utils.unitize((value) => {
        const num = parseFloat(value)
        return num % 100 + '%'
      }),
    },
  })
}

// ============================================
// 3. SLOW PARALLAX MOTION
// ============================================
export const createParallaxMotion = (
  element: HTMLElement | string,
  speed: number = 0.5,
  trigger?: HTMLElement | string
): gsap.core.Tween | null => {
  if (prefersReducedMotion()) return null

  const el = typeof element === 'string' 
    ? document.querySelector(element) as HTMLElement
    : element

  if (!el) return null

  return gsap.to(el, {
    y: speed * 100,
    ease: 'none',
    scrollTrigger: {
      trigger: trigger || el,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  } as any)
}

// ============================================
// 4. CLEANUP UTILITY
// ============================================
export const cleanupGSAPAnimations = (animations: (gsap.core.Tween | ScrollTrigger | null)[]): void => {
  animations.forEach((anim) => {
    if (!anim) return
    
    if ('kill' in anim) {
      anim.kill()
    }
    if ('kill' in anim && 'vars' in anim && (anim.vars as any)?.scrollTrigger) {
      const st = (anim.vars as any).scrollTrigger as ScrollTrigger
      st.kill()
    }
  })
}