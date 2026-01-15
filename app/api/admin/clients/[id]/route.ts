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
      
      // 1. Delete InvoiceItems (through Invoices)
      const Invoice = require('@/entities/Invoice').Invoice
      const InvoiceItem = require('@/entities/InvoiceItem').InvoiceItem
      const invoiceRepository = transactionalEntityManager.getRepository(Invoice)
      const invoiceItemRepository = transactionalEntityManager.getRepository(InvoiceItem)
      
      const invoices = await invoiceRepository.find({ where: { clientId: id } })
      for (const invoice of invoices) {
        // Delete invoice items first
        await invoiceItemRepository.delete({ invoiceId: invoice.id })
      }
      
      // 2. Delete Invoices
      await invoiceRepository.delete({ clientId: id })
      
      // 3. Delete Projects and their related records
      const Project = require('@/entities/Project').Project
      const Payment = require('@/entities/Payment').Payment
      const HostingService = require('@/entities/HostingService').HostingService
      const projectRepository = transactionalEntityManager.getRepository(Project)
      const paymentRepository = transactionalEntityManager.getRepository(Payment)
      const hostingRepository = transactionalEntityManager.getRepository(HostingService)
      
      const projects = await projectRepository.find({ where: { clientId: id } })
      for (const project of projects) {
        // Delete payments
        await paymentRepository.delete({ projectId: project.id })
        // Delete hosting services
        await hostingRepository.delete({ projectId: project.id })
      }
      
      // 4. Delete Projects
      await projectRepository.delete({ clientId: id })
      
      // 5. Delete ClientNotes
      const ClientNote = require('@/entities/ClientNote').ClientNote
      const clientNoteRepository = transactionalEntityManager.getRepository(ClientNote)
      await clientNoteRepository.delete({ clientId: id })
      
      // 6. Delete Reminders related to this client
      const Reminder = require('@/entities/Reminder').Reminder
      const reminderRepository = transactionalEntityManager.getRepository(Reminder)
      await reminderRepository.delete({ 
        relatedEntityType: 'client',
        relatedEntityId: id 
      })

      // 7. Delete Notifications related to this client
      const Notification = require('@/entities/Notification').Notification
      const notificationRepository = transactionalEntityManager.getRepository(Notification)
      await notificationRepository.delete({ 
        relatedEntityType: 'client',
        relatedEntityId: id 
      })

      // 8. Finally, delete the client
      await transactionalEntityManager.remove(client)
    })

    return NextResponse.json({ success: true, message: 'Müşteri başarıyla silindi' })
  } catch (error: any) {
    console.error('Error deleting client:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack?.substring(0, 500)
    })
    return NextResponse.json(
      { 
        error: 'Müşteri silinemedi',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}