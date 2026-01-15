'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface SessionCheckerProps {
  children: React.ReactNode
  hasSession: boolean
}

export function SessionChecker({ children, hasSession }: SessionCheckerProps) {
  const pathname = usePathname()
  const hasRedirected = useRef(false)

  // Don't run on login page
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    // Skip if on login page or if we have session
    if (isLoginPage || hasSession) {
      return
    }

    // If no session and haven't redirected yet, redirect ONCE
    if (!hasSession && !hasRedirected.current) {
      hasRedirected.current = true
      console.log('SessionChecker - No session, redirecting to login')
      // Clear any invalid cookie
      document.cookie = 'admin-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      // Redirect immediately
      window.location.href = '/admin/login'
    }
  }, [hasSession, isLoginPage])

  // If on login page or have session, render children
  if (isLoginPage || hasSession) {
    return <>{children}</>
  }

  // If redirecting, show loading (this should be brief)
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-lg text-neutral-700">Yönlendiriliyorsunuz...</p>
      </div>
    </div>
  )
}
