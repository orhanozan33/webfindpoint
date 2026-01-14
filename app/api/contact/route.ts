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
        try {
          const dataSource = await initializeDatabase()
          const contactRepository = dataSource.getRepository(Contact)
          const agencyRepository = dataSource.getRepository(Agency)
          const notificationRepository = dataSource.getRepository(Notification)

          // Save contact message
          const contact = contactRepository.create({
            name,
            email,
            message,
            status: 'new',
          })

          await contactRepository.save(contact)

          // Create notification for admin
          // Find first active agency (or create notification for all agencies)
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
        } catch (dbError) {
          console.error('Database error:', dbError)
          // In production, you might want to use an email service or external API
          return NextResponse.json(
            { error: 'Failed to save contact submission' },
            { status: 500 }
          )
        }

    return NextResponse.json(
      { message: 'Contact form submitted successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error saving contact:', error)
    
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