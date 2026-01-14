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

    // Check if client has projects (optional warning, but we'll still allow deletion)
    const Project = require('@/entities/Project').Project
    const projectRepository = dataSource.getRepository(Project)
    const projectCount = await projectRepository.count({ where: { clientId: id } })
    
    if (projectCount > 0) {
      // Still allow deletion, but log a warning
      console.warn(`Deleting client ${id} with ${projectCount} associated projects`)
    }

    await clientRepository.remove(client)

    return NextResponse.json({ success: true, message: 'Müşteri başarıyla silindi' })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Müşteri silinemedi' },
      { status: 500 }
    )
  }
}