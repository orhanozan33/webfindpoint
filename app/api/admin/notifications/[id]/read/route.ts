import { NextRequest, NextResponse } from 'next/server'
import { authorize } from '@/lib/auth/authorize'
import { initializeDatabase } from '@/lib/db/database'
import { Notification } from '@/entities/Notification'
import { scopeToAgency, getAgencyContext } from '@/lib/multi-tenant/scope'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request)
  if (!auth.authorized) {
    return auth.response!
  }

  try {
    const { id } = await params
    const context = await getAgencyContext(auth.session!)
    const dataSource = await initializeDatabase()
    const notificationRepository = dataSource.getRepository(Notification)

    let query = notificationRepository
      .createQueryBuilder('notification')
      .where('notification.id = :id', { id })

    query = scopeToAgency(query, context, 'notification')

    const notification = await query.getOne()

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    notification.isRead = true
    notification.readAt = new Date()
    await notificationRepository.save(notification)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}