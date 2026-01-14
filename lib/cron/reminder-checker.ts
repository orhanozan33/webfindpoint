import { initializeDatabase } from '@/lib/db/database'
import { Reminder } from '@/entities/Reminder'
import { format, addDays, isBefore, differenceInDays } from 'date-fns'

export interface ReminderCheckResult {
  processed: number
  sent: number
  failed: number
}

/**
 * Check and process reminders that are due
 * This should be called by a cron job daily
 */
export async function checkAndProcessReminders(): Promise<ReminderCheckResult> {
  const dataSource = await initializeDatabase()
  const reminderRepository = dataSource.getRepository(Reminder)

  const now = new Date()
  const results: ReminderCheckResult = {
    processed: 0,
    sent: 0,
    failed: 0,
  }

  try {
    // Find all pending reminders that are due or overdue
    const dueReminders = await reminderRepository.find({
      where: {
        isCompleted: false,
        notificationStatus: 'pending',
      },
      order: { dueDate: 'ASC' },
    })

    for (const reminder of dueReminders) {
      results.processed++

      const dueDate = new Date(reminder.dueDate)
      const daysUntilDue = differenceInDays(dueDate, now)

      // Check if reminder should be sent (within the daysBeforeReminder window)
      if (daysUntilDue <= reminder.daysBeforeReminder || isBefore(dueDate, now)) {
        try {
          // Send notification (extendable - email, SMS, etc.)
          await sendReminderNotification(reminder)

          reminder.notificationStatus = 'sent'
          reminder.lastNotifiedAt = now
          reminder.notificationAttempts += 1

          await reminderRepository.save(reminder)
          results.sent++
        } catch (error) {
          console.error(`Failed to send reminder ${reminder.id}:`, error)
          reminder.notificationStatus = 'failed'
          reminder.notificationAttempts += 1
          await reminderRepository.save(reminder)
          results.failed++
        }
      }
    }

    return results
  } catch (error) {
    console.error('Error checking reminders:', error)
    throw error
  }
}

/**
 * Send reminder notification
 * Extendable for email, SMS, Slack, etc.
 */
async function sendReminderNotification(reminder: Reminder): Promise<void> {
  // TODO: Implement actual notification sending
  // This is a placeholder for email/SMS/Slack integration
  
  console.log(`[REMINDER] ${reminder.title} - Due: ${format(new Date(reminder.dueDate), 'yyyy-MM-dd')}`)
  
  // Example: Email integration
  // await sendEmail({
  //   to: 'admin@findpoint.ca',
  //   subject: `Reminder: ${reminder.title}`,
  //   body: reminder.description || reminder.title,
  // })
}