'use client'

// Analytics abstraction layer
// Supports Google Analytics, custom events, and privacy-friendly tracking

export interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
}

class AnalyticsTracker {
  private isEnabled: boolean = true
  private gaId: string | null = null

  constructor() {
    // Check if analytics should be enabled
    if (typeof window !== 'undefined') {
      this.isEnabled = !localStorage.getItem('analytics-disabled')
      this.gaId = process.env.NEXT_PUBLIC_GA_ID || null
      this.initGA()
    }
  }

  private initGA() {
    if (!this.isEnabled || !this.gaId || typeof window === 'undefined') return

    // Initialize Google Analytics
    if (typeof window.gtag === 'undefined') {
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`
      document.head.appendChild(script)

      window.dataLayer = window.dataLayer || []
      function gtag(...args: any[]) {
        window.dataLayer.push(args)
      }
      window.gtag = gtag
      window.gtag('js', new Date())
      window.gtag('config', this.gaId, {
        page_path: window.location.pathname,
      })
    }
  }

  trackEvent(event: AnalyticsEvent) {
    if (!this.isEnabled) return

    // Google Analytics
    if (this.gaId && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      })
    }

    // Custom analytics endpoint (optional)
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
          path: window.location.pathname,
        }),
        keepalive: true,
      }).catch(() => {
        // Silently fail
      })
    }
  }

  trackPageView(path: string) {
    if (!this.isEnabled || !this.gaId) return

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', this.gaId, {
        page_path: path,
      })
    }
  }

  trackConversion(action: string, value?: number) {
    this.trackEvent({
      action,
      category: 'conversion',
      value,
    })
  }

  trackCTA(ctaName: string) {
    this.trackEvent({
      action: 'click',
      category: 'cta',
      label: ctaName,
    })
  }

  trackFormSubmission(formName: string) {
    this.trackEvent({
      action: 'submit',
      category: 'form',
      label: formName,
    })
    this.trackConversion('form_submission', 1)
  }
}

export const analytics = new AnalyticsTracker()

// Declare gtag for TypeScript
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}