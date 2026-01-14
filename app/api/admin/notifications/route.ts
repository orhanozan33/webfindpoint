import { NextRequest, NextResponse } from 'next/server'
import { authorize } from '@/lib/auth/authorize'
import { initializeDatabase } from '@/lib/db/database'
import { Notification } from '@/entities/Notification'
import { scopeToAgency, getAgencyContext } from '@/lib/multi-tenant/scope'

export async function GET(request: NextRequest) {
  const auth = await authorize(request)
  if (!auth.authorized) {
    return auth.response!
  }

  const context = await getAgencyContext(auth.session!)
  const dataSource = await initializeDatabase()
  const notificationRepository = dataSource.getRepository(Notification)

  let query = notificationRepository
    .createQueryBuilder('notification')
    .where('notification.userId = :userId OR notification.userId IS NULL', {
      userId: context.userId,
    })
    .orderBy('notification.createdAt', 'DESC')
    .take(50)

  // Scope to agency (unless super admin)
  query = scopeToAgency(query, context, 'notification')

  const notifications = await query.getMany()
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return NextResponse.json({
    notifications,
    unreadCount,
  })
}

export async function POST(request: NextRequest) {
  const auth = await authorize(request, { requiredPermission: 'canManageReminders' })
  if (!auth.authorized) {
    return auth.response!
  }

  try {
    const body = await request.json()
    const { type, title, message, link, severity, relatedEntityType, relatedEntityId, userId } =
      body

    if (!type || !title) {
      return NextResponse.json(
        { error: 'Type and title are required' },
        { status: 400 }
      )
    }

    const context = await getAgencyContext(auth.session!)
    if (!context.agencyId) {
      return NextResponse.json(
        { error: 'Agency context required' },
        { status: 400 }
      )
    }

    const dataSource = await initializeDatabase()
    const notificationRepository = dataSource.getRepository(Notification)

    const notification = notificationRepository.create({
      agencyId: context.agencyId,
      userId: userId || context.userId,
      type,
      title,
      message,
      link,
      severity: severity || 'info',
      relatedEntityType,
      relatedEntityId,
      isRead: false,
    })

    await notificationRepository.save(notification)

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}