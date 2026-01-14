import { NextRequest, NextResponse } from 'next/server'
import { authorize } from '@/lib/auth/authorize'
import { initializeDatabase } from '@/lib/db/database'
import { ClientNote } from '@/entities/ClientNote'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request, { requiredPermission: 'canManageClients' })
  if (!auth.authorized) {
    return auth.response!
  }

  const { id } = await params
  const dataSource = await initializeDatabase()
  const notesRepository = dataSource.getRepository(ClientNote)
  const notes = await notesRepository.find({
    where: { clientId: id },
    relations: ['createdBy'],
    order: { createdAt: 'DESC' },
  })

  return NextResponse.json(notes)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request, { requiredPermission: 'canManageClients' })
  if (!auth.authorized) {
    return auth.response!
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { content, category, isImportant } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const dataSource = await initializeDatabase()
    const notesRepository = dataSource.getRepository(ClientNote)

    const note = notesRepository.create({
      clientId: id,
      createdById: auth.session!.userId,
      content,
      category: category || 'general',
      isImportant: isImportant || false,
      isAIGenerated: false,
    })

    await notesRepository.save(note)

    const savedNote = await notesRepository.findOne({
      where: { id: note.id },
      relations: ['createdBy'],
    })

    return NextResponse.json(savedNote, { status: 201 })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
}