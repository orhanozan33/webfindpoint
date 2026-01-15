import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/database'
import { Client } from '@/entities/Client'
import { getAgencyContext } from '@/lib/multi-tenant/scope'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const dataSource = await initializeDatabase()
  const clientRepository = dataSource.getRepository(Client)
  const client = await clientRepository.findOne({ where: { id } })

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  return NextResponse.json(client)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { name, email, companyName, phone, notes, status } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const dataSource = await initializeDatabase()
    const clientRepository = dataSource.getRepository(Client)
    const client = await clientRepository.findOne({ where: { id } })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    client.name = name
    client.email = email
    client.companyName = companyName
    client.phone = phone
    client.notes = notes
    client.status = status || 'active'

    await clientRepository.save(client)

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const dataSource = await initializeDatabase()
    const clientRepository = dataSource.getRepository(Client)
    const context = await getAgencyContext(session)
    
    const client = await clientRepository.findOne({ 
      where: { id },
      select: ['id', 'agencyId'],
    })

    if (!client) {
      return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 })
    }

    // Verify agency access (unless super admin)
    if (context.role !== 'super_admin' && client.agencyId !== context.agencyId) {
      return NextResponse.json(
        { error: 'Bu müşteriyi silme yetkiniz yok' },
        { status: 403 }
      )
    }

    // Use transaction to ensure all deletions succeed or fail together
    await dataSource.transaction(async (transactionalEntityManager) => {
      // Delete all related records before deleting the client
      // This prevents foreign key constraint errors
      
      console.log(`[DELETE CLIENT] Starting deletion for client ID: ${id}`)
      
      // 1. Delete InvoiceItems (through Invoices)
      const Invoice = require('@/entities/Invoice').Invoice
      const InvoiceItem = require('@/entities/InvoiceItem').InvoiceItem
      const invoiceRepository = transactionalEntityManager.getRepository(Invoice)
      const invoiceItemRepository = transactionalEntityManager.getRepository(InvoiceItem)
      
      const invoices = await invoiceRepository.find({ where: { clientId: id } })
      console.log(`[DELETE CLIENT] Found ${invoices.length} invoice(s)`)
      for (const invoice of invoices) {
        // Delete invoice items first
        const deletedItems = await invoiceItemRepository.delete({ invoiceId: invoice.id })
        console.log(`[DELETE CLIENT] Deleted invoice items for invoice ${invoice.id}`)
      }
      
      // 2. Delete Invoices
      const deletedInvoices = await invoiceRepository.delete({ clientId: id })
      console.log(`[DELETE CLIENT] Deleted ${deletedInvoices.affected || 0} invoice(s)`)
      
      // 3. Delete Projects and their related records
      const Project = require('@/entities/Project').Project
      const Payment = require('@/entities/Payment').Payment
      const HostingService = require('@/entities/HostingService').HostingService
      const projectRepository = transactionalEntityManager.getRepository(Project)
      const paymentRepository = transactionalEntityManager.getRepository(Payment)
      const hostingRepository = transactionalEntityManager.getRepository(HostingService)
      
      const projects = await projectRepository.find({ where: { clientId: id } })
      console.log(`[DELETE CLIENT] Found ${projects.length} project(s)`)
      for (const project of projects) {
        // Delete payments
        const deletedPayments = await paymentRepository.delete({ projectId: project.id })
        console.log(`[DELETE CLIENT] Deleted ${deletedPayments.affected || 0} payment(s) for project ${project.id}`)
        // Delete hosting services
        const deletedHosting = await hostingRepository.delete({ projectId: project.id })
        console.log(`[DELETE CLIENT] Deleted ${deletedHosting.affected || 0} hosting service(s) for project ${project.id}`)
      }
      
      // 4. Delete Projects
      const deletedProjects = await projectRepository.delete({ clientId: id })
      console.log(`[DELETE CLIENT] Deleted ${deletedProjects.affected || 0} project(s)`)
      
      // 5. Delete ClientNotes
      const ClientNote = require('@/entities/ClientNote').ClientNote
      const clientNoteRepository = transactionalEntityManager.getRepository(ClientNote)
      const deletedNotes = await clientNoteRepository.delete({ clientId: id })
      console.log(`[DELETE CLIENT] Deleted ${deletedNotes.affected || 0} client note(s)`)
      
      // 6. Delete Reminders related to this client
      const Reminder = require('@/entities/Reminder').Reminder
      const reminderRepository = transactionalEntityManager.getRepository(Reminder)
      const deletedReminders = await reminderRepository.delete({ 
        relatedEntityType: 'client',
        relatedEntityId: id 
      })
      console.log(`[DELETE CLIENT] Deleted ${deletedReminders.affected || 0} reminder(s)`)

      // 7. Delete Notifications related to this client
      const Notification = require('@/entities/Notification').Notification
      const notificationRepository = transactionalEntityManager.getRepository(Notification)
      const deletedNotifications = await notificationRepository.delete({ 
        relatedEntityType: 'client',
        relatedEntityId: id 
      })
      console.log(`[DELETE CLIENT] Deleted ${deletedNotifications.affected || 0} notification(s)`)

      // 8. Finally, delete the client (use delete instead of remove for transaction safety)
      const clientRepository = transactionalEntityManager.getRepository(Client)
      const deletedClient = await clientRepository.delete({ id })
      console.log(`[DELETE CLIENT] Deleted client: ${deletedClient.affected || 0} row(s)`)
      
      if (!deletedClient.affected || deletedClient.affected === 0) {
        throw new Error('Client could not be deleted - no rows affected')
      }
    })

    return NextResponse.json({ success: true, message: 'Müşteri başarıyla silindi' })
  } catch (error: any) {
    console.error('❌ Error deleting client:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      constraint: error.constraint,
      detail: error.detail,
      table: error.table,
      stack: error.stack?.substring(0, 1000)
    })
    
    // Check for specific PostgreSQL foreign key constraint errors
    if (error.code === '23503' || error.constraint) {
      console.error('Foreign key constraint violation detected')
      return NextResponse.json(
        { 
          error: 'Müşteri silinemedi: Bu müşteriye bağlı kayıtlar bulunmaktadır',
          details: process.env.NODE_ENV === 'development' ? `Constraint: ${error.constraint}, Table: ${error.table}` : undefined
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Müşteri silinemedi',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}