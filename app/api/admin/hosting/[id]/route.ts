import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/database'
import { HostingService } from '@/entities/HostingService'

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
    const hostingRepository = dataSource.getRepository(HostingService)
    const hosting = await hostingRepository.findOne({
      where: { id },
      relations: ['project', 'project.client'],
    })

    if (!hosting) {
      return NextResponse.json({ error: 'Hosting service not found' }, { status: 404 })
    }

    return NextResponse.json(hosting)
  } catch (error) {
    console.error('Error fetching hosting service:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hosting service' },
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
    const { provider, plan, startDate, endDate, autoRenew, monthlyCost, currency, notes, projectId } = body

    if (!provider || !startDate) {
      return NextResponse.json(
        { error: 'Provider and start date are required' },
        { status: 400 }
      )
    }

    const dataSource = await initializeDatabase()
    const hostingRepository = dataSource.getRepository(HostingService)
    const hosting = await hostingRepository.findOne({ where: { id } })

    if (!hosting) {
      return NextResponse.json({ error: 'Hosting service not found' }, { status: 404 })
    }

    hosting.provider = provider
    hosting.plan = plan
    hosting.startDate = new Date(startDate)
    hosting.endDate = endDate ? new Date(endDate) : undefined
    hosting.autoRenew = autoRenew || false
    hosting.monthlyCost = monthlyCost ? parseFloat(monthlyCost) : undefined
    hosting.currency = currency || 'CAD'
    hosting.notes = notes
    hosting.projectId = projectId || undefined

    await hostingRepository.save(hosting)

    return NextResponse.json(hosting)
  } catch (error) {
    console.error('Error updating hosting service:', error)
    return NextResponse.json(
      { error: 'Failed to update hosting service' },
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
    const hostingRepository = dataSource.getRepository(HostingService)
    const hosting = await hostingRepository.findOne({ where: { id } })

    if (!hosting) {
      return NextResponse.json({ error: 'Hosting service not found' }, { status: 404 })
    }

    await hostingRepository.remove(hosting)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting hosting service:', error)
    return NextResponse.json(
      { error: 'Failed to delete hosting service' },
      { status: 500 }
    )
  }
}
