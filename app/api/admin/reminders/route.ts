import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/database'
import { Reminder } from '@/entities/Reminder'
import { getAgencyContext } from '@/lib/multi-tenant/scope'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const dataSource = await initializeDatabase()
    const reminderRepository = dataSource.getRepository(Reminder)
    const context = await getAgencyContext(session)
    
    const reminders = await reminderRepository.find({
      where: context.agencyId ? { agencyId: context.agencyId } : {},
      order: { dueDate: 'ASC' },
    })

    return NextResponse.json(reminders)
  } catch (error) {
    console.error('Error fetching reminders:', error)
      return NextResponse.json(
        { error: 'Hatırlatıcılar getirilemedi' },
        { status: 500 }
      )
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type, title, description, dueDate, daysBeforeReminder, relatedEntityType, relatedEntityId } = body

    if (!type || !title || !dueDate) {
      return NextResponse.json(
        { error: 'Tip, başlık ve bitiş tarihi gereklidir' },
        { status: 400 }
      )
    }

    const dataSource = await initializeDatabase()
    const reminderRepository = dataSource.getRepository(Reminder)
    const context = await getAgencyContext(session)

    // Super admins can create reminders without agencyId (will use first agency as fallback)
    // For other roles, agencyId is required
    if (!context.agencyId && context.role !== 'super_admin') {
      console.error('Agency context error:', { context, session })
      return NextResponse.json(
        { error: 'Agency bağlamı gereklidir. Lütfen yöneticinizle iletişime geçin.' },
        { status: 400 }
      )
    }

    // For super admins without agencyId, use first active agency
    let finalAgencyId = context.agencyId
    if (!finalAgencyId && context.role === 'super_admin') {
      const Agency = require('@/entities/Agency').Agency
      const agencyRepository = dataSource.getRepository(Agency)
      const firstAgency = await agencyRepository.findOne({
        where: { isActive: true },
        select: ['id'],
        order: { createdAt: 'ASC' },
      })
      if (firstAgency) {
        finalAgencyId = firstAgency.id
      } else {
        return NextResponse.json(
          { error: 'Sistemde aktif bir agency bulunamadı. Lütfen önce bir agency oluşturun.' },
          { status: 400 }
        )
      }
    }

    // If relatedEntityId is provided, try to get agencyId from related entity
    if (relatedEntityId && relatedEntityType) {
      try {
        if (relatedEntityType === 'project') {
          const Project = require('@/entities/Project').Project
          const projectRepository = dataSource.getRepository(Project)
          const project = await projectRepository.findOne({
            where: { id: relatedEntityId },
            select: ['id', 'agencyId'],
          })
          if (project && project.agencyId) {
            finalAgencyId = project.agencyId
          }
        } else if (relatedEntityType === 'client') {
          const Client = require('@/entities/Client').Client
          const clientRepository = dataSource.getRepository(Client)
          const client = await clientRepository.findOne({
            where: { id: relatedEntityId },
            select: ['id', 'agencyId'],
          })
          if (client && client.agencyId) {
            finalAgencyId = client.agencyId
          }
        }
      } catch (error) {
        console.warn('Error fetching related entity agencyId:', error)
      }
    }

    if (!finalAgencyId) {
      return NextResponse.json(
        { error: 'Agency bağlamı belirlenemedi' },
        { status: 400 }
      )
    }

    // Create reminder using insert to avoid loading relations and cyclic dependency
    const insertResult = await reminderRepository.insert({
      agencyId: finalAgencyId,
      type,
      title,
      description,
      dueDate: new Date(dueDate),
      daysBeforeReminder: daysBeforeReminder || 30,
      relatedEntityType,
      relatedEntityId,
      isCompleted: false,
      notificationStatus: 'pending',
    })

    const reminderId = insertResult.identifiers[0].id

    // Fetch the created reminder without relations to avoid cyclic dependency
    const reminder = await reminderRepository.findOne({
      where: { id: reminderId },
      select: ['id', 'agencyId', 'type', 'title', 'description', 'dueDate', 'daysBeforeReminder', 'relatedEntityType', 'relatedEntityId', 'isCompleted', 'notificationStatus', 'lastNotifiedAt', 'notificationAttempts', 'completedAt', 'createdAt', 'updatedAt'],
    })

    if (!reminder) {
      throw new Error('Reminder was created but could not be retrieved')
    }

    return NextResponse.json(reminder, { status: 201 })
  } catch (error: any) {
    console.error('Error creating reminder:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      constraint: error?.constraint,
      detail: error?.detail,
      table: error?.table,
      stack: error?.stack?.substring(0, 500)
    })
    
    // Check for specific database constraint errors
    if (error?.code === '23503' || error?.constraint) {
      return NextResponse.json(
        { 
          error: 'Hatırlatıcı oluşturulamadı: Geçersiz bağlantı hatası',
          details: process.env.NODE_ENV === 'development' ? `Constraint: ${error.constraint}, Table: ${error.table}` : undefined
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Hatırlatıcı oluşturulamadı',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}
