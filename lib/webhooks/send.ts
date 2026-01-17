/**
 * Webhook sender utility
 * Sends notifications to external webhook service
 * 
 * Usage in admin panel:
 * import { sendWebhookNotification } from '@/lib/webhooks/send'
 * 
 * await sendWebhookNotification({
 *   type: 'MESSAGE',
 *   title: 'Yeni Mesaj',
 *   message: 'Mesaj içeriği',
 *   data: { orderId: 123 }
 * })
 */

export interface WebhookPayload {
  type: 'ORDER' | 'MESSAGE' | 'FORM' | 'SYSTEM'
  title: string
  message?: string
  data?: {
    [key: string]: any
    link?: string
    agencyId?: string
    relatedEntityType?: string
    relatedEntityId?: string
  }
}

export async function sendWebhookNotification(payload: WebhookPayload): Promise<boolean> {
  try {
    const webhookEndpoint = process.env.WEBHOOK_ENDPOINT || 'http://192.168.2.41:3000/api/v1/webhooks/receive'
    const webhookUrl = process.env.WEBHOOK_URL || 'webhook_4c66e2163cdc4b19e8a4ae6365aebbcf'
    const webhookKey = process.env.WEBHOOK_KEY || 'c67280852e146b74c1a506ffddbb39130d233600b5ef6e0211087a362853afa2'

    // Skip if webhook is disabled
    if (process.env.WEBHOOK_ENABLED !== 'true' && !process.env.WEBHOOK_ENDPOINT) {
      return false
    }

    const response = await fetch(webhookEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-url': webhookUrl,
        'x-webhook-key': webhookKey,
      },
      body: JSON.stringify({
        type: payload.type,
        title: payload.title,
        message: payload.message || '',
        data: payload.data || {},
      }),
    })

    if (!response.ok) {
      console.error('Webhook send failed:', response.status, await response.text())
      return false
    }

    return true
  } catch (error) {
    // Log error but don't fail the main operation
    console.error('Webhook send error:', error)
    return false
  }
}
