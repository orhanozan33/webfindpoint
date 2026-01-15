import { ReminderForm } from '@/components/admin/ReminderForm'

// Force dynamic rendering because we use cookies in admin layout
export const dynamic = 'force-dynamic'

export default function NewReminderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Yeni Hatırlatıcı</h1>
        <p className="text-neutral-600">Yeni bir hatırlatıcı oluşturun</p>
      </div>

      <ReminderForm />
    </div>
  )
}
