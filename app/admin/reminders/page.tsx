import { initializeDatabase } from '@/lib/db/database'
import { Reminder } from '@/entities/Reminder'
import dynamicImport from 'next/dynamic'
import Link from 'next/link'

// Force dynamic rendering because we use cookies in admin layout
export const dynamic = 'force-dynamic'

// Dynamic import to prevent useContext errors
const RemindersList = dynamicImport(() => import('@/components/admin/RemindersList').then((mod) => ({ default: mod.RemindersList })), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
      <p className="text-neutral-500">Yükleniyor...</p>
    </div>
  ),
})

export default async function RemindersPage() {
  let reminders: any[] = []
  
  try {
    const dataSource = await initializeDatabase()
    const reminderRepository = dataSource.getRepository(Reminder)
    const reminderEntities = await reminderRepository.find({
      order: { dueDate: 'ASC' },
    })
    
    // Serialize entities to plain objects
    reminders = reminderEntities.map((reminder) => ({
      id: reminder.id,
      type: reminder.type,
      title: reminder.title,
      description: reminder.description,
      dueDate: reminder.dueDate,
      isCompleted: reminder.isCompleted,
      completedAt: reminder.completedAt,
      notificationStatus: reminder.notificationStatus,
      lastNotifiedAt: reminder.lastNotifiedAt,
      notificationAttempts: reminder.notificationAttempts,
      relatedEntityType: reminder.relatedEntityType,
      relatedEntityId: reminder.relatedEntityId,
      daysBeforeReminder: reminder.daysBeforeReminder,
      createdAt: reminder.createdAt,
      updatedAt: reminder.updatedAt,
    }))
  } catch (error) {
    console.error('Error fetching reminders:', error)
  }

  const upcoming = reminders.filter((r) => !r.isCompleted && new Date(r.dueDate) >= new Date())
  const completed = reminders.filter((r) => r.isCompleted)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Hatırlatıcılar</h1>
          <p className="text-neutral-600">Hatırlatıcıları ve bildirimleri yönetin</p>
        </div>
        <Link
          href="/admin/reminders/new"
          className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Hatırlatıcı Ekle
        </Link>
      </div>

      <RemindersList reminders={upcoming} completed={completed} />
    </div>
  )
}