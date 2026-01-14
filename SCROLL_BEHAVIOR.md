# Scroll Behavior Rules (CRITICAL UX)

## ✅ DO (Allowed)

- **Native smooth scrolling** (`scroll-behavior: smooth`)
- **Optional Lenis-style smooth scroll** (subtle, non-intrusive)
- **Continuous natural scroll flow** (no interruptions)
- **Motion triggers on scroll** (GSAP ScrollTrigger for animations only)
- **Native touch scrolling** (no hijacking on mobile)

## ❌ DON'T (Forbidden)

- ❌ **CSS scroll-snap** (`scroll-snap-type: none !important`)
- ❌ **Full-page snapping** (no page-by-page jumps)
- ❌ **Page-by-page jump scrolling** (continuous flow only)
- ❌ **Scroll hijacking** (motion never controls scroll position)
- ❌ **Prevent default scroll** (user always controls scroll)

## Implementation

### CSS (`app/globals.css`)

```css
html {
  scroll-behavior: smooth; /* Native smooth scroll */
  scroll-snap-type: none !important; /* STRICTLY NO snap */
  overscroll-behavior: auto; /* Prevent hijacking */
}

/* Enforced globally - NO scroll-snap anywhere */
*,
*::before,
*::after {
  scroll-snap-align: none !important;
  scroll-snap-stop: normal !important;
  scroll-snap-type: none !important;
}
```

### Lenis Configuration (`SmoothScrollProvider.tsx`)

```typescript
const lenis = new Lenis({
  duration: 1.0, // Faster, natural
  smoothWheel: true, // Only wheel, not touch
  wheelMultiplier: 0.8, // Less aggressive
  smoothTouch: false, // CRITICAL: Native touch
  preventDefault: false, // Don't prevent default
  infinite: false, // No infinite scroll
})
```

### GSAP ScrollTrigger

- **Only triggers animations** (fade, slide, etc.)
- **Never controls scroll position**
- **Never prevents default scroll**
- **Never locks scroll axis**

## Key Principles

1. **User controls scroll** - Always
2. **Motion enhances, never hijacks** - Animations respond to scroll, don't control it
3. **Continuous flow** - No snapping, no jumping, no interruptions
4. **Native behavior** - Touch scrolling is always native
5. **Optional enhancement** - Lenis is optional, can be disabled

## Testing Checklist

- [ ] No scroll-snap anywhere (check DevTools)
- [ ] Native touch scrolling works on mobile
- [ ] Wheel scrolling is smooth but not hijacked
- [ ] Scroll position is never locked
- [ ] Animations trigger on scroll but don't control it
- [ ] Reduced motion disables Lenis
- [ ] No page-by-page jumping
- [ ] Continuous scroll flow throughout site