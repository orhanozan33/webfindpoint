import dynamic from 'next/dynamic'

// Force dynamic rendering because we use cookies in admin layout
export const dynamic = 'force-dynamic'

const SettingsForm = dynamic(
  () => import('@/components/admin/SettingsForm').then((mod) => ({ default: mod.SettingsForm })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-xl p-8 border border-neutral-200">
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-600">Yükleniyor...</div>
        </div>
      </div>
    ),
  }
)

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Ayarlar</h1>
        <p className="text-neutral-600">Sistem ayarlarını ve hizmet görsellerini yönetin</p>
      </div>

      <SettingsForm />
    </div>
  )
}
