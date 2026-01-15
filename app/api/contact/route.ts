import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/database'
import { Contact } from '@/entities/Contact'
import { Notification } from '@/entities/Notification'
import { Agency } from '@/entities/Agency'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Initialize database connection
    const dataSource = await initializeDatabase()
    const contactRepository = dataSource.getRepository(Contact)
    const agencyRepository = dataSource.getRepository(Agency)
    const notificationRepository = dataSource.getRepository(Notification)

    // Save contact message (this is the critical operation - must succeed)
    const contact = contactRepository.create({
      name,
      email,
      message,
      status: 'new',
    })

    await contactRepository.save(contact)

    // Create notification for admin (this is optional - don't fail if it errors)
    try {
      const agencies = await agencyRepository.find({
        where: { isActive: true },
        take: 1,
      })

      if (agencies.length > 0) {
        const agencyId = agencies[0].id

        // Create notification
        const notification = notificationRepository.create({
          agencyId,
          type: 'contact_submission',
          title: `Yeni İletişim Mesajı: ${name}`,
          message: `${email} adresinden yeni bir mesaj geldi: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`,
          link: '/admin/contacts',
          severity: 'info',
          relatedEntityType: 'contact',
          relatedEntityId: contact.id,
          isRead: false,
        })

        await notificationRepository.save(notification)
      }
    } catch (notificationError: any) {
      // Log notification error but don't fail the request
      console.error('Failed to create notification (contact was saved):', notificationError)
      // Continue - the contact message was successfully saved
    }

    // Always return success if contact was saved, even if notification failed
    return NextResponse.json(
      { message: 'Contact form submitted successfully' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error saving contact:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      stack: error?.stack?.substring(0, 500)
    })
    
    // In development, return the error. In production, you might want to log it differently
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { error: 'Failed to submit contact form', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    )
  }
}