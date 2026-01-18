import dynamicImport from 'next/dynamic'

// Force dynamic rendering because we use cookies in admin layout
export const dynamic = 'force-dynamic'

const NotificationsPageClient = dynamicImport(
  () =>
    import('@/components/admin/NotificationsPageClient').then((mod) => ({
      default: mod.NotificationsPageClient,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
        <p className="text-neutral-500">Yükleniyor...</p>
      </div>
    ),
  }
)

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Bildirimler</h1>
        <p className="text-neutral-600">Tüm bildirimlerinizi buradan görüntüleyin</p>
      </div>

      <NotificationsPageClient />
    </div>
  )
}

