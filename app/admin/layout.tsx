import { getSession } from '@/lib/auth/session'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { headers } from 'next/headers'
import { ClientRedirect } from '@/components/admin/ClientRedirect'
// import { AnimatedNetwork } from '@/components/background/AnimatedNetwork' // Disabled for admin performance

// Dynamic imports with no SSR to prevent useContext errors
const AdminHeader = dynamic(() => import('@/components/admin/AdminHeader').then((mod) => ({ default: mod.AdminHeader })), {
  ssr: false,
  loading: () => <div className="h-16 bg-white border-b border-neutral-200" />,
})

const AdminSidebar = dynamic(
  () => import('@/components/admin/AdminSidebarClient').then((mod) => ({ default: mod.AdminSidebarClient })),
  {
    ssr: false,
    loading: () => <div className="w-64 bg-white border-r border-neutral-200 min-h-screen" />,
  }
)

const MobileBottomNav = dynamic(() => import('@/components/admin/MobileBottomNavClient').then((mod) => ({ default: mod.MobileBottomNavClient })), {
  ssr: false,
})

const PageTransition = dynamic(() => import('@/components/admin/PageTransition').then((mod) => ({ default: mod.PageTransition })), {
  ssr: false,
})

const LoadingBar = dynamic(() => import('@/components/admin/LoadingBar').then((mod) => ({ default: mod.LoadingBar })), {
  ssr: false,
})

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    // Get current pathname to check if we're on login page
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') || ''
    
    // If we're on login page, render without layout (login has its own layout)
    const isLoginPage = pathname === '/admin/login' || pathname.startsWith('/admin/login')
    if (isLoginPage) {
      return <>{children}</>
    }

    // Full JWT verification happens here (server-side only)
    const session = await getSession()

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('AdminLayout - Pathname:', pathname)
      console.log('AdminLayout - Session:', session ? { userId: session.userId, email: session.email, role: session.role } : 'NULL')
    }

    // Role-based access control
    const isValidRole = session && (session.role === 'super_admin' || session.role === 'admin' || session.role === 'staff')
    
    if (!isValidRole) {
      console.log('AdminLayout - Invalid role or no session:', session?.role || 'NO_SESSION')
      // Invalid session - use client-side redirect to prevent server-side redirect loop
      return <ClientRedirect to="/admin/login" />
    }

    // Valid session - render admin layout
    return (
      <div className="min-h-screen bg-neutral-50 relative overflow-x-hidden">
        {/* AnimatedNetwork disabled in admin for better performance */}
        {/* <AnimatedNetwork className="opacity-30" /> */}
        <LoadingBar />
        <div className="relative z-10">
          <Suspense fallback={<div className="h-16 bg-white border-b border-neutral-200" />}>
            <AdminHeader session={session} />
          </Suspense>
          <div className="flex">
            <AdminSidebar />
            <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 pb-24 md:pb-8 overflow-x-hidden">
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
          <MobileBottomNav />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Admin layout error:', error)
    // If there's an error, check if we're on login page
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') || ''
    const isLoginPage = pathname === '/admin/login' || pathname.startsWith('/admin/login')
    
    if (isLoginPage) {
      return <>{children}</>
    }
    
    // If there's an error and not on login page, use client redirect
    return <ClientRedirect to="/admin/login" />
  }
}