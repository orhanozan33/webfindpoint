# FindPoint Motion System 🎬

Production-ready motion system for Next.js App Router with Framer Motion, GSAP, and accessibility-first design.

## 📦 Features

- ✅ **Framer Motion Variants** - Reusable, production-optimized
- ✅ **GSAP Infinite Loops** - Seamless carousels and background motion
- ✅ **Reduced Motion Support** - Full accessibility compliance
- ✅ **Performance Optimized** - GPU-accelerated, no CLS
- ✅ **TypeScript** - Fully typed
- ✅ **Mobile Optimized** - Low-power device detection

## 🚀 Quick Start

### Basic Fade In

```tsx
import { MotionWrapper } from '@/components/motion/MotionWrapper'
import { fadeIn } from '@/lib/motion/variants'

<MotionWrapper variants={fadeIn}>
  <h1>Hello World</h1>
</MotionWrapper>
```

### Staggered Animation

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

### Infinite Carousel

```tsx
import { InfiniteCarousel } from '@/components/motion/InfiniteCarousel'

<InfiniteCarousel speed={50} direction="left">
  {logos.map((logo) => (
    <Logo key={logo.id} src={logo.src} />
  ))}
</InfiniteCarousel>
```

## 📚 Available Variants

### Framer Motion Variants

- `fadeIn` - Simple opacity fade
- `slideUp` - Fade + slide up
- `slideLeft` / `slideRight` - Horizontal slides
- `staggerContainer` - Container for staggered children
- `staggerItem` - Item for staggered animation
- `hoverLift` - Subtle lift on hover
- `buttonPulse` - Subtle infinite pulse

### Usage with Delay

```tsx
import { createVariantsWithDelay } from '@/lib/motion/variants'

const delayedFadeIn = createVariantsWithDelay(fadeIn, 0.5)
```

## 🔄 GSAP Infinite Loops

### Horizontal Carousel

```tsx
import { createInfiniteCarousel } from '@/lib/motion/gsap-infinite'

useEffect(() => {
  const anim = createInfiniteCarousel('#carousel', 50, 'left')
  return () => anim?.kill()
}, [])
```

### Background Loop

```tsx
import { createBackgroundLoop } from '@/lib/motion/gsap-infinite'

useEffect(() => {
  const anim = createBackgroundLoop('#background', 20, 'x')
  return () => anim?.kill()
}, [])
```

## ♿ Accessibility

The system automatically detects `prefers-reduced-motion` and simplifies all animations:

```tsx
import { useReducedMotion } from '@/lib/motion/useReducedMotion'

const prefersReduced = useReducedMotion()
// Returns true if user prefers reduced motion OR device is low-power
```

## ⚡ Performance

- **GPU Accelerated** - All animations use `transform` and `opacity`
- **No CLS** - Fixed dimensions, no layout shifts
- **Mobile Optimized** - Reduced duration on low-power devices
- **Cleanup** - GSAP animations properly cleaned up on unmount

## 🎨 Motion Design Rules

1. **One primary motion per section**
2. **Subtle > flashy**
3. **Guide attention, don't distract**
4. **Respect user preferences**
5. **Mobile-first performance**

## 📖 Full Documentation

See `production-checklist.md` for complete production requirements.