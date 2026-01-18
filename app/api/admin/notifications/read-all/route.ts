import { NextRequest, NextResponse } from 'next/server'
import { authorize } from '@/lib/auth/authorize'
import { initializeDatabase } from '@/lib/db/database'
import { Notification } from '@/entities/Notification'
import { Contact } from '@/entities/Contact'
import { scopeToAgency, getAgencyContext } from '@/lib/multi-tenant/scope'

export async function POST(request: NextRequest) {
  const auth = await authorize(request)
  if (!auth.authorized) {
    return auth.response!
  }

  try {
    const context = await getAgencyContext(auth.session!)
    const dataSource = await initializeDatabase()
    const notificationRepository = dataSource.getRepository(Notification)

    let query = notificationRepository
      .createQueryBuilder('notification')
      .where('notification.isRead = :isRead', { isRead: false })
      .andWhere('(notification.userId = :userId OR notification.userId IS NULL)', {
        userId: context.userId,
      })

    query = scopeToAgency(query, context, 'notification')

    const notifications = await query.getMany()

    notifications.forEach((notification) => {
      notification.isRead = true
      notification.readAt = new Date()
    })

    await notificationRepository.save(notifications)

    // Also mark all "new" contact submissions as read so the badge count matches reality
    try {
      const contactRepository = dataSource.getRepository(Contact)
      await contactRepository
        .createQueryBuilder()
        .update()
        .set({ status: 'read' })
        .where('status = :status', { status: 'new' })
        .execute()
    } catch (e) {
      console.error('Error marking all contacts as read:', e)
    }

    return NextResponse.json({ success: true, count: notifications.length })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}