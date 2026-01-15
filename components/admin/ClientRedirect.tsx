'use client'

import { useEffect, useRef } from 'react'

export function ClientRedirect({ to }: { to: string }) {
  const hasRedirected = useRef(false)
  
  useEffect(() => {
    // Only redirect once to prevent loops
    if (!hasRedirected.current) {
      hasRedirected.current = true
      // Clear invalid cookie first
      document.cookie = 'admin-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      // Use window.location for hard redirect (prevents loops)
      window.location.href = to
    }
  }, [to])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-lg text-neutral-700">Yönlendiriliyorsunuz...</p>
      </div>
    </div>
  )
}
