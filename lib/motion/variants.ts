import { Variants, Transition } from 'framer-motion'
import { prefersReducedMotion, shouldDisableAnimations } from './reducedMotion'

// Production-optimized easing curves
const EASING = {
  smooth: [0.22, 1, 0.36, 1] as [number, number, number, number],
  spring: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
}

// Base transition config (GPU-accelerated, no layout shifts)
const baseTransition: Transition = {
  duration: 0.6,
  ease: EASING.smooth,
}

// Reduced motion transition (opacity only)
const reducedTransition: Transition = {
  duration: 0.3,
  ease: 'easeOut',
}

// ============================================
// 1. FADE IN VARIANTS
// ============================================
export const fadeIn: Variants = {
  hidden: { 
    opacity: 0,
  },
  visible: { 
    opacity: 1,
    transition: baseTransition,
  },
}

// ============================================
// 2. SLIDE UP VARIANTS
// ============================================
export const slideUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20, // Using transform (GPU-accelerated)
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: baseTransition,
  },
}

// ============================================
// 3. SLIDE LEFT / RIGHT VARIANTS
// ============================================
export const slideLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -30, // Using transform
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: baseTransition,
  },
}

export const slideRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 30, // Using transform
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: baseTransition,
  },
}

// ============================================
// 4. STAGGER CONTAINER
// ============================================
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      ...baseTransition,
    },
  },
}

// Stagger item (used with staggerContainer)
export const staggerItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20, // Transform only
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: EASING.smooth,
    },
  },
}

// ============================================
// 5. HOVER LIFT
// ============================================
export const hoverLift: Variants = {
  rest: {
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: EASING.smooth,
    },
  },
  hover: {
    scale: 1.02,
    y: -5, // Transform only
    transition: {
      duration: 0.3,
      ease: EASING.smooth,
    },
  },
}

// ============================================
// 5B. HOVER SCALE (For portfolio items)
// ============================================
export const hoverScale: Variants = {
  rest: {
    scale: 1,
    transition: {
      duration: 0.3,
      ease: EASING.smooth,
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: EASING.smooth,
    },
  },
}

// ============================================
// 6. BUTTON PULSE (Subtle Infinite)
// ============================================
export const buttonPulse: Variants = {
  animate: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
      repeatType: 'loop' as const,
    },
  },
}

// ============================================
// 6B. FLOATING ANIMATION (Infinite Loop)
// ============================================
export const floating: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
      repeatType: 'loop' as const,
    },
  },
}

// ============================================
// 7. VIEWPORT-BASED VARIANTS
// ============================================
export const viewportFadeIn: Variants = {
  hidden: { 
    opacity: 0,
  },
  visible: { 
    opacity: 1,
    transition: {
      ...baseTransition,
      when: 'beforeChildren',
    },
  },
}

// ============================================
// 8. REDUCED MOTION VARIANTS
// ============================================

// Note: withReducedMotion is exported from ./reducedMotion.ts

// ============================================
// 9. UTILITY: CREATE CUSTOM VARIANTS WITH DELAY
// ============================================
export const createVariantsWithDelay = (
  baseVariants: Variants,
  delay: number = 0
): Variants => {
  return {
    ...baseVariants,
    visible: {
      ...baseVariants.visible,
      transition: {
        ...(baseVariants.visible as any)?.transition,
        delay,
      },
    },
  }
}

// ============================================
// 10. UTILITY: CREATE VIEWPORT VARIANTS
// ============================================
export const createViewportVariants = (
  baseVariants: Variants,
  amount: number = 0.2
): Variants => {
  return {
    ...baseVariants,
    visible: {
      ...baseVariants.visible,
      transition: {
        ...(baseVariants.visible as any)?.transition,
        when: 'beforeChildren',
      },
    },
  }
}

// Export all variants as a single object for easy access
export const motionVariants = {
  fadeIn,
  slideUp,
  slideLeft,
  slideRight,
  staggerContainer,
  staggerItem,
  hoverLift,
  hoverScale,
  buttonPulse,
  floating,
  viewportFadeIn,
} as const