import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/database'
import { Notification } from '@/entities/Notification'
import { Agency } from '@/entities/Agency'

/**
 * Webhook receiver endpoint
 * Accepts notifications from external webhook service
 * 
 * Expected headers:
 * - x-webhook-url: Webhook identifier
 * - x-webhook-key: Webhook secret key
 * 
 * Expected body:
 * {
 *   type: 'ORDER' | 'MESSAGE' | 'FORM' | 'SYSTEM',
 *   title: string,
 *   message: string,
 *   data?: object
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get webhook credentials from headers
    const webhookUrl = request.headers.get('x-webhook-url')
    const webhookKey = request.headers.get('x-webhook-key')

    // Validate webhook credentials
    const expectedWebhookUrl = process.env.WEBHOOK_URL || 'webhook_4c66e2163cdc4b19e8a4ae6365aebbcf'
    const expectedWebhookKey = process.env.WEBHOOK_KEY || 'c67280852e146b74c1a506ffddbb39130d233600b5ef6e0211087a362853afa2'

    if (!webhookUrl || !webhookKey) {
      return NextResponse.json(
        { error: 'Missing webhook credentials' },
        { status: 401 }
      )
    }

    if (webhookUrl !== expectedWebhookUrl || webhookKey !== expectedWebhookKey) {
      return NextResponse.json(
        { error: 'Invalid webhook credentials' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { type, title, message, data } = body

    // Validation
    if (!type || !title) {
      return NextResponse.json(
        { error: 'Type and title are required' },
        { status: 400 }
      )
    }

    // Initialize database
    const dataSource = await initializeDatabase()
    const notificationRepository = dataSource.getRepository(Notification)
    const agencyRepository = dataSource.getRepository(Agency)

    // Get first active agency (or use data.agencyId if provided)
    const agencies = await agencyRepository.find({
      where: { isActive: true },
      take: 1,
    })

    if (agencies.length === 0) {
      return NextResponse.json(
        { error: 'No active agency found' },
        { status: 500 }
      )
    }

    const agencyId = data?.agencyId || agencies[0].id

    // Map webhook type to notification severity
    const getSeverity = (webhookType: string) => {
      switch (webhookType.toUpperCase()) {
        case 'ORDER':
          return 'success'
        case 'MESSAGE':
        case 'FORM':
          return 'info'
        case 'SYSTEM':
          return 'warning'
        default:
          return 'info'
      }
    }

    // Map webhook type to notification type
    const getNotificationType = (webhookType: string) => {
      switch (webhookType.toUpperCase()) {
        case 'ORDER':
          return 'order_received'
        case 'MESSAGE':
          return 'external_message'
        case 'FORM':
          return 'form_submission'
        case 'SYSTEM':
          return 'system_alert'
        default:
          return 'external_notification'
      }
    }

    // Create notification
    const notification = notificationRepository.create({
      agencyId,
      type: getNotificationType(type),
      title,
      message: message || '',
      link: data?.link || null,
      severity: getSeverity(type),
      relatedEntityType: data?.relatedEntityType || null,
      relatedEntityId: data?.relatedEntityId || null,
      isRead: false,
    })

    await notificationRepository.save(notification)

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        createdAt: notification.createdAt,
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error('Webhook receive error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process webhook',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}
