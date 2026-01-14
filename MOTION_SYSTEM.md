# FindPoint Motion System 🎬

Production-ready motion implementation for Next.js App Router with Framer Motion, GSAP, and full accessibility support.

## 📁 File Structure

```
lib/motion/
├── variants.ts          # Framer Motion variants (fadeIn, slideUp, etc.)
├── reducedMotion.ts     # Accessibility & reduced motion utilities
├── gsapLoops.ts         # GSAP infinite loop animations
├── gsap-config.ts       # GSAP scroll-based animations
└── index.ts             # Central exports

components/motion/
├── MotionWrapper.tsx    # Generic motion wrapper
├── FadeIn.tsx           # FadeIn component
├── HoverLift.tsx        # Hover lift component
├── ScrollReveal.tsx     # Scroll-triggered reveal
├── StaggerContainer.tsx # Staggered animation container
├── StaggerItem.tsx      # Staggered animation item
├── InfiniteCarousel.tsx  # GSAP infinite carousel
├── BackgroundLoop.tsx    # Continuous background motion
└── SmoothScrollProvider.tsx # Smooth scroll wrapper
```

## 🚀 Quick Start

### 1. FadeIn Component

```tsx
import { FadeIn } from '@/components/motion/FadeIn'

<FadeIn delay={0.2}>
  <h1>Hello World</h1>
</FadeIn>
```

### 2. Hover Lift

```tsx
import { HoverLift } from '@/components/motion/HoverLift'

<HoverLift liftAmount={5} scaleAmount={1.02}>
  <Card>Content</Card>
</HoverLift>
```

### 3. Staggered Animation

```tsx
import { StaggerContainer, StaggerItem } from '@/components/motion'

<StaggerContainer>
  {items.map((item) => (
    <StaggerItem key={item.id}>
      <Card>{item.content}</Card>
    </StaggerItem>
  ))}
</StaggerContainer>
```

### 4. Infinite Carousel (GSAP)

```tsx
import { InfiniteCarousel } from '@/components/motion/InfiniteCarousel'

<InfiniteCarousel speed={50} direction="left" pauseOnHover>
  {logos.map((logo) => (
    <Logo key={logo.id} src={logo.src} />
  ))}
</InfiniteCarousel>
```

### 5. Animated Button with Pulse

```tsx
import { AnimatedButton } from '@/components/ui/AnimatedButton'

<AnimatedButton 
  href="/contact" 
  variant="primary" 
  size="lg"
  pulse={true}
>
  Get Started
</AnimatedButton>
```

## 📚 Available Variants

### Framer Motion Variants

- `fadeIn` - Simple opacity fade
- `slideUp` - Fade + slide up (20px)
- `slideLeft` / `slideRight` - Horizontal slides (30px)
- `staggerContainer` - Container for staggered children
- `staggerItem` - Item for staggered animation
- `hoverLift` - Subtle lift on hover (scale + y)
- `buttonPulse` - Subtle infinite pulse (scale 1 → 1.02)
- `floating` - Infinite floating motion (y: 0 → -10)

### Usage with Custom Delay

```tsx
import { createVariantsWithDelay, slideUp } from '@/lib/motion/variants'

const delayedSlideUp = createVariantsWithDelay(slideUp, 0.5)

<MotionWrapper variants={delayedSlideUp}>
  <Content />
</MotionWrapper>
```

## 🔁 GSAP Infinite Loops

### Horizontal Carousel

```tsx
import { createInfiniteCarousel, cleanupCarousel } from '@/lib/motion/gsapLoops'

useEffect(() => {
  const anim = createInfiniteCarousel('#carousel', {
    speed: 50,
    direction: 'left',
    pauseOnHover: true,
  })
  
  return () => {
    if (anim) cleanupCarousel('#carousel', anim)
  }
}, [])
```

### Background Floating

```tsx
import { createFloatingMotion, cleanupGSAPAnimation } from '@/lib/motion/gsapLoops'

useEffect(() => {
  const anim = createFloatingMotion('#background', {
    speed: 20,
    distance: 50,
    axis: 'both', // 'x' | 'y' | 'both'
  })
  
  return () => {
    if (anim) cleanupGSAPAnimation(anim)
  }
}, [])
```

## ♿ Accessibility

### Automatic Reduced Motion Detection

All components automatically respect `prefers-reduced-motion`:

```tsx
import { useReducedMotion } from '@/lib/motion/reducedMotion'

const prefersReduced = useReducedMotion()
// Returns true if user prefers reduced motion OR device is low-power
```

### Manual Check

```tsx
import { shouldDisableAnimations, prefersReducedMotion } from '@/lib/motion/reducedMotion'

if (shouldDisableAnimations()) {
  // Use simplified animations
}
```

## ⚡ Performance Features

✅ **GPU Accelerated** - All animations use `transform` and `opacity` only  
✅ **No CLS** - Fixed dimensions, no layout shifts  
✅ **Mobile Optimized** - Reduced duration on low-power devices  
✅ **Memory Safe** - GSAP animations properly cleaned up  
✅ **Core Web Vitals Safe** - No impact on LCP, FID, or CLS  

## 🌍 i18n Compatibility

Motion system is completely independent from i18n:

- No re-triggering on language switch
- Works with all locales (/en, /fr, /tr)
- Motion wrappers don't depend on text content

## 📋 Production Checklist

- [x] No CLS issues (transform + opacity only)
- [x] Core Web Vitals safe
- [x] Accessible (WCAG compliant)
- [x] Mobile-friendly (low-power device detection)
- [x] SEO-safe (no blocking animations)
- [x] Clean unmount behavior (GSAP cleanup)
- [x] TypeScript fully typed
- [x] Next.js App Router optimized
- [x] Turbopack compatible

## 🎨 Motion Design Principles

1. **One primary motion per section**
2. **Subtle > flashy**
3. **Guide attention, don't distract**
4. **Respect user preferences**
5. **Mobile-first performance**

## 📖 Real Usage Examples

See `app/[locale]/page.tsx` for production examples:
- Hero section with FadeIn + slideUp
- Services cards with HoverLift
- Portfolio grid with staggered reveal
- CTA button with pulse animation

All components are production-ready and fully typed!