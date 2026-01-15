import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { headers } from 'next/headers'
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
    if (pathname === '/admin/login' || pathname.startsWith('/admin/login')) {
      return <>{children}</>
    }

    // Full JWT verification happens here (server-side only)
    const session = await getSession()

    // If no session and not on login page, redirect to login
    if (!session) {
      redirect('/admin/login')
    }

    // Role-based access control
    if (session.role !== 'super_admin' && session.role !== 'admin' && session.role !== 'staff') {
      redirect('/admin/login')
    }

    return (
      <div className="min-h-screen bg-neutral-50 relative overflow-x-hidden">
        {/* AnimatedNetwork disabled in admin for better performance */}
        {/* <AnimatedNetwork className="opacity-30" /> */}
        <div className="relative z-10">
          <Suspense fallback={<div className="h-16 bg-white border-b border-neutral-200" />}>
            <AdminHeader session={session} />
          </Suspense>
          <div className="flex">
            <AdminSidebar />
            <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 pb-24 md:pb-8 overflow-x-hidden">
              {children}
            </main>
          </div>
          <MobileBottomNav />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Admin layout error:', error)
    // If there's an error, redirect to login
    redirect('/admin/login')
  }
}