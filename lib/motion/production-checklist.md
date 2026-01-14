# Production Motion Checklist ✅

## Performance Requirements

- [x] **No CLS (Cumulative Layout Shift)**
  - All animations use `transform` and `opacity` only
  - No width/height animations
  - Fixed dimensions for animated elements

- [x] **GPU Acceleration**
  - All transforms use `will-change: transform, opacity`
  - `transform: translateZ(0)` for hardware acceleration
  - `backface-visibility: hidden` for smooth rendering

- [x] **No Blocking Rendering**
  - Animations use `requestAnimationFrame`
  - GSAP timelines properly cleaned up on unmount
  - No synchronous layout calculations

- [x] **Mobile Performance**
  - Reduced animation duration on low-power devices
  - Simplified animations for mobile
  - Touch-optimized interactions

## Accessibility Requirements

- [x] **Reduced Motion Support**
  - Detects `prefers-reduced-motion`
  - Falls back to opacity-only transitions
  - No layout shifts when motion is disabled

- [x] **WCAG Compliance**
  - Motion doesn't cause seizures
  - Content remains readable
  - Focus states are clear

## Code Quality

- [x] **Clean TypeScript Typing**
  - All variants properly typed
  - No `any` types
  - Proper return types

- [x] **Reusable Components**
  - Centralized variants file
  - Composable motion components
  - DRY principles

- [x] **Memory Management**
  - GSAP animations cleaned up
  - Event listeners removed
  - No memory leaks

## SEO & Core Web Vitals

- [x] **No Impact on LCP**
  - Animations don't delay content
  - Critical content loads first

- [x] **No Impact on FID**
  - Animations don't block interactions
  - Event handlers are optimized

- [x] **No Impact on CLS**
  - Fixed dimensions
  - Transform-only animations

## Motion Design Rules

- [x] **Guides Attention**
  - Primary motion per section
  - Subtle, not flashy
  - Calm and premium feel

- [x] **Never Overwhelming**
  - One primary motion at a time
  - Staggered reveals, not all at once
  - Respects user preferences