import { initializeDatabase } from '@/lib/db/database'
import { Notification } from '@/entities/Notification'
import { Reminder } from '@/entities/Reminder'
import { Invoice } from '@/entities/Invoice'
import { Project } from '@/entities/Project'
import { HostingService } from '@/entities/HostingService'
import { differenceInDays, isBefore, addDays } from 'date-fns'

/**
 * Generate notifications from various sources
 * Called by cron jobs or manual triggers
 */
export async function generateNotificationsForAgency(agencyId: string): Promise<number> {
  const dataSource = await initializeDatabase()
  const notificationRepository = dataSource.getRepository(Notification)
  let count = 0

  // 1. Check reminders
  const reminderRepository = dataSource.getRepository(Reminder)
  const dueReminders = await reminderRepository.find({
    where: {
      agencyId,
      isCompleted: false,
      notificationStatus: 'pending',
    },
  })

  for (const reminder of dueReminders) {
    const daysUntil = differenceInDays(new Date(reminder.dueDate), new Date())
    if (daysUntil <= reminder.daysBeforeReminder || isBefore(new Date(reminder.dueDate), new Date())) {
      await notificationRepository.save(
        notificationRepository.create({
          agencyId,
          type: reminder.type,
          title: reminder.title,
          message: reminder.description,
          severity: daysUntil < 0 ? 'error' : daysUntil <= 7 ? 'warning' : 'info',
          relatedEntityType: 'reminder',
          relatedEntityId: reminder.id,
        })
      )
      count++
    }
  }

  // 2. Check overdue invoices
  const invoiceRepository = dataSource.getRepository(Invoice)
  const overdueInvoices = await invoiceRepository.find({
    where: {
      agencyId,
      status: 'sent',
    },
  })
  
  const today = new Date()
  const overdue = overdueInvoices.filter(
    (invoice) => new Date(invoice.dueDate) < today
  )

  for (const invoice of overdue) {
    const daysOverdue = differenceInDays(new Date(), new Date(invoice.dueDate))
    await notificationRepository.save(
      notificationRepository.create({
        agencyId,
        type: 'invoice_overdue',
        title: `Invoice ${invoice.invoiceNumber} is overdue`,
        message: `Invoice is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`,
        link: `/admin/invoices/${invoice.id}`,
        severity: 'error',
        relatedEntityType: 'invoice',
        relatedEntityId: invoice.id,
      })
    )
    count++
  }

  // 3. Check project deadlines
  const projectRepository = dataSource.getRepository(Project)
  const allProjects = await projectRepository.find({
    where: { agencyId },
  })
  
  const now = new Date()
  const weekFromNow = addDays(now, 7)
  const upcomingDeadlines = allProjects.filter(
    (project) =>
      project.deliveryDate &&
      new Date(project.deliveryDate) >= now &&
      new Date(project.deliveryDate) <= weekFromNow &&
      project.status !== 'completed'
  )

  for (const project of upcomingDeadlines) {
    const daysUntil = differenceInDays(new Date(project.deliveryDate!), new Date())
    await notificationRepository.save(
      notificationRepository.create({
        agencyId,
        type: 'project_deadline',
        title: `Project "${project.name}" deadline approaching`,
        message: `Delivery due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
        link: `/admin/projects/${project.id}`,
        severity: daysUntil <= 3 ? 'warning' : 'info',
        relatedEntityType: 'project',
        relatedEntityId: project.id,
      })
    )
    count++
  }

  // 4. Check expiring hosting
  const hostingRepository = dataSource.getRepository(HostingService)
  const allHosting = await hostingRepository.find({
    where: { agencyId },
  })
  
  const monthFromNow = addDays(now, 30)
  const expiringHosting = allHosting.filter(
    (hosting) =>
      hosting.endDate &&
      new Date(hosting.endDate) >= now &&
      new Date(hosting.endDate) <= monthFromNow
  )

  for (const hosting of expiringHosting) {
    const daysUntil = differenceInDays(new Date(hosting.endDate!), new Date())
    await notificationRepository.save(
      notificationRepository.create({
        agencyId,
        type: 'hosting_expiration',
        title: `Hosting expiring: ${hosting.provider}`,
        message: `Hosting service expires in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
        link: `/admin/hosting/${hosting.id}`,
        severity: daysUntil <= 7 ? 'warning' : 'info',
        relatedEntityType: 'hosting',
        relatedEntityId: hosting.id,
      })
    )
    count++
  }

  return count
}