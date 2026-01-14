import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/database'
import { Client } from '@/entities/Client'
import { getAgencyContext } from '@/lib/multi-tenant/scope'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const dataSource = await initializeDatabase()
    const clientRepository = dataSource.getRepository(Client)
    const context = await getAgencyContext(session)
    
    const clients = await clientRepository.find({
      where: context.agencyId ? { agencyId: context.agencyId } : {},
      order: { createdAt: 'DESC' },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
      return NextResponse.json(
        { error: 'Müşteriler getirilemedi' },
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
    const { name, email, companyName, phone, notes, status } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const dataSource = await initializeDatabase()
    const clientRepository = dataSource.getRepository(Client)
    const context = await getAgencyContext(session)

    // Super admins can create clients without agencyId (will use first agency as fallback)
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

    const client = clientRepository.create({
      agencyId: finalAgencyId!,
      name,
      email,
      companyName,
      phone,
      notes,
      status: status || 'active',
    })

    await clientRepository.save(client)

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
      return NextResponse.json(
        { error: 'Müşteri oluşturulamadı' },
        { status: 500 }
      )
  }
}