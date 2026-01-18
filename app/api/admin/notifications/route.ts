import { NextRequest, NextResponse } from 'next/server'
import { authorize } from '@/lib/auth/authorize'
import { initializeDatabase } from '@/lib/db/database'
import { Notification } from '@/entities/Notification'
import { Contact } from '@/entities/Contact'
import { Agency } from '@/entities/Agency'
import { scopeToAgency, getAgencyContext } from '@/lib/multi-tenant/scope'

export async function GET(request: NextRequest) {
  const auth = await authorize(request)
  if (!auth.authorized) {
    return auth.response!
  }

  const context = await getAgencyContext(auth.session!)
  const url = new URL(request.url)
  const limitParam = url.searchParams.get('limit')
  const limitRaw = limitParam ? Number(limitParam) : 50
  const limit = Number.isFinite(limitRaw) ? Math.min(100, Math.max(1, limitRaw)) : 50

  const dataSource = await initializeDatabase()
  const notificationRepository = dataSource.getRepository(Notification)
  const contactRepository = dataSource.getRepository(Contact)
  const agencyRepository = dataSource.getRepository(Agency)

  // Backfill: turn "new" contact submissions into notifications (if missing).
  // Important: notifications are scoped by agency for non-super-admin users, so we must
  // create/check per-agency to ensure every agency admin sees the alert.
  try {
    let targetAgencyIds: string[] = []
    if (context.role === 'super_admin') {
      const agencies = await agencyRepository.find({ select: ['id'] })
      targetAgencyIds = agencies.map((a) => a.id)
    } else if (context.agencyId) {
      targetAgencyIds = [context.agencyId]
    } else {
      const agency = await agencyRepository.findOne({ select: ['id'] })
      if (agency?.id) targetAgencyIds = [agency.id]
    }

    if (targetAgencyIds.length > 0) {
      const newContacts = await contactRepository.find({
        where: { status: 'new' },
        order: { createdAt: 'DESC' },
        take: 50,
      })

      if (newContacts.length > 0) {
        const ids = newContacts.map((c) => c.id)
        const existing = await notificationRepository
          .createQueryBuilder('notification')
          .where('notification.type = :type', { type: 'contact_submission' })
          .andWhere('notification.relatedEntityType = :ret', { ret: 'contact' })
          .andWhere('notification.relatedEntityId IN (:...ids)', { ids })
          .andWhere('notification.agencyId IN (:...agencyIds)', { agencyIds: targetAgencyIds })
          .getMany()

        const existingKeys = new Set(
          existing.map((n) => `${n.agencyId}:${n.relatedEntityId}`)
        )

        const toCreate: Notification[] = []
        for (const agencyId of targetAgencyIds) {
          for (const c of newContacts) {
            const key = `${agencyId}:${c.id}`
            if (existingKeys.has(key)) continue
            toCreate.push(
              notificationRepository.create({
                agencyId,
                // userId intentionally left NULL so all admins can see it
                type: 'contact_submission',
                title: `Yeni İletişim Mesajı: ${c.name}`,
                message: `${c.email} adresinden yeni bir mesaj geldi: ${c.message.substring(0, 100)}${
                  c.message.length > 100 ? '...' : ''
                }`,
                link: '/admin/contacts',
                severity: 'info',
                relatedEntityType: 'contact',
                relatedEntityId: c.id,
                isRead: false,
              })
            )
          }
        }

        if (toCreate.length > 0) {
          await notificationRepository.save(toCreate)
        }
      }
    }
  } catch (error) {
    // Never fail the request due to backfill
    console.error('Error backfilling contact notifications:', error)
  }

  let query = notificationRepository
    .createQueryBuilder('notification')
    .where('notification.userId = :userId OR notification.userId IS NULL', {
      userId: context.userId,
    })
    .orderBy('notification.createdAt', 'DESC')
    .take(limit)

  // Scope to agency (unless super admin)
  query = scopeToAgency(query, context, 'notification')

  const notifications = await query.getMany()

  // Accurate unread count (not limited by `limit`)
  let unreadQuery = notificationRepository
    .createQueryBuilder('notification')
    .where('notification.isRead = :isRead', { isRead: false })
    .andWhere('(notification.userId = :userId OR notification.userId IS NULL)', {
      userId: context.userId,
    })
  unreadQuery = scopeToAgency(unreadQuery, context, 'notification')
  const unreadCount = await unreadQuery.getCount()

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