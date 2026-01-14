import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/database'
import { Reminder } from '@/entities/Reminder'

export async function GET(
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
    const reminderRepository = dataSource.getRepository(Reminder)
    const reminder = await reminderRepository.findOne({ where: { id } })

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
    }

    return NextResponse.json(reminder)
  } catch (error) {
    console.error('Error fetching reminder:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reminder' },
      { status: 500 }
    )
  }
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
    const { type, title, description, dueDate, daysBeforeReminder, relatedEntityType, relatedEntityId, isCompleted } = body

    if (!type || !title || !dueDate) {
      return NextResponse.json(
        { error: 'Type, title, and due date are required' },
        { status: 400 }
      )
    }

    const dataSource = await initializeDatabase()
    const reminderRepository = dataSource.getRepository(Reminder)
    const reminder = await reminderRepository.findOne({ where: { id } })

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
    }

    reminder.type = type
    reminder.title = title
    reminder.description = description
    reminder.dueDate = new Date(dueDate)
    reminder.daysBeforeReminder = daysBeforeReminder || 30
    reminder.relatedEntityType = relatedEntityType
    reminder.relatedEntityId = relatedEntityId
    
    if (isCompleted !== undefined) {
      reminder.isCompleted = isCompleted
      if (isCompleted && !reminder.completedAt) {
        reminder.completedAt = new Date()
      } else if (!isCompleted) {
        reminder.completedAt = undefined
      }
    }

    await reminderRepository.save(reminder)

    return NextResponse.json(reminder)
  } catch (error) {
    console.error('Error updating reminder:', error)
    return NextResponse.json(
      { error: 'Failed to update reminder' },
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
    const reminderRepository = dataSource.getRepository(Reminder)
    const reminder = await reminderRepository.findOne({ where: { id } })

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
    }

    await reminderRepository.remove(reminder)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting reminder:', error)
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    )
  }
}
