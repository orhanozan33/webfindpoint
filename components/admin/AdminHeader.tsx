'use client'

import { useRouter } from 'next/navigation'
import { SessionPayload } from '@/lib/auth/session'
import dynamic from 'next/dynamic'

// Dynamic import to prevent SSR issues
const NotificationCenter = dynamic(() => import('@/components/admin/NotificationCenter').then((mod) => ({ default: mod.NotificationCenter })), {
  ssr: false,
  loading: () => <div className="w-6 h-6" />,
})

interface AdminHeaderProps {
  session: SessionPayload
}

export function AdminHeader({ session }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-neutral-200 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg md:text-xl font-bold">
            <span className="bg-gradient-to-r from-neutral-900 via-cyan-600 to-blue-600 bg-clip-text text-transparent">FindPoint</span>
            <span className="text-neutral-900 hidden sm:inline"> Yönetim Paneli</span>
            <span className="text-neutral-900 sm:hidden"> Panel</span>
          </h2>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
          <NotificationCenter agencyId={session.agencyId} />
          <span className="hidden md:inline text-sm text-neutral-600">{session.email}</span>
          <button
            onClick={handleLogout}
            className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors touch-manipulation min-h-[36px] sm:min-h-[40px]"
          >
            <span className="hidden md:inline">Çıkış Yap</span>
            <span className="md:hidden">Çıkış</span>
          </button>
        </div>
      </div>
    </header>
  )
}