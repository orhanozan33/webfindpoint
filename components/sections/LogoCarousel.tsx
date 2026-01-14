'use client'

import { InfiniteCarousel } from '@/components/motion/InfiniteCarousel'

interface LogoCarouselProps {
  logos: string[]
  speed?: number
  direction?: 'left' | 'right'
}

export function LogoCarousel({ 
  logos, 
  speed = 50,
  direction = 'left' 
}: LogoCarouselProps) {
  // Duplicate logos for seamless loop
  const duplicatedLogos = [...logos, ...logos]

  return (
    <div className="overflow-hidden py-12 bg-neutral-50">
      <InfiniteCarousel speed={speed} direction={direction} pauseOnHover>
        {duplicatedLogos.map((logo, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-32 h-16 flex items-center justify-center text-2xl font-bold text-neutral-400 opacity-60 hover:opacity-100 transition-opacity"
          >
            {logo}
          </div>
        ))}
      </InfiniteCarousel>
    </div>
  )
}

// Alternative CSS-based infinite scroll (more performant)
export function LogoCarouselCSS({ logos }: { logos: string[] }) {
  const duplicatedLogos = [...logos, ...logos, ...logos]

  return (
    <div className="overflow-hidden py-12 bg-neutral-50 relative">
      <div className="flex gap-12 items-center animate-scroll">
        {duplicatedLogos.map((logo, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-32 h-16 flex items-center justify-center text-2xl font-bold text-neutral-400 opacity-60 hover:opacity-100 transition-opacity"
          >
            {logo}
          </div>
        ))}
      </div>
    </div>
  )
}