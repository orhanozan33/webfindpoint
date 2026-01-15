import { initializeDatabase } from '@/lib/db/database'
import { Reminder } from '@/entities/Reminder'
import { notFound } from 'next/navigation'
import { ReminderForm } from '@/components/admin/ReminderForm'

// Force dynamic rendering because we use cookies in admin layout
export const dynamic = 'force-dynamic'

export default async function ReminderEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let reminder: any = null
  
  try {
    const dataSource = await initializeDatabase()
    const reminderRepository = dataSource.getRepository(Reminder)
    const reminderEntity = await reminderRepository.findOne({ where: { id } })

    if (!reminderEntity) {
      notFound()
    }
    
    // Serialize reminder to plain object
    reminder = {
      id: reminderEntity.id,
      type: reminderEntity.type,
      title: reminderEntity.title,
      description: reminderEntity.description,
      dueDate: reminderEntity.dueDate,
      daysBeforeReminder: reminderEntity.daysBeforeReminder,
      relatedEntityType: reminderEntity.relatedEntityType,
      relatedEntityId: reminderEntity.relatedEntityId,
      isCompleted: reminderEntity.isCompleted,
    }
  } catch (error) {
    console.error('Error fetching reminder:', error)
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Hatırlatıcıyı Düzenle</h1>
        <p className="text-neutral-600">Hatırlatıcı bilgilerini güncelleyin</p>
      </div>

      <ReminderForm reminder={reminder} />
    </div>
  )
}
