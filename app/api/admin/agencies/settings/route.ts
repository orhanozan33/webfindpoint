import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/database'
import { Agency } from '@/entities/Agency'
import { getAgencyContext } from '@/lib/multi-tenant/scope'

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { agencyId, taxRate, defaultCurrency } = body

    if (!agencyId) {
      return NextResponse.json(
        { error: 'Agency ID is required' },
        { status: 400 }
      )
    }

    const context = await getAgencyContext(session)
    
    // Verify agency access (unless super admin)
    if (context.role !== 'super_admin' && context.agencyId !== agencyId) {
      return NextResponse.json(
        { error: 'Bu agency ayarlarını değiştirme yetkiniz yok' },
        { status: 403 }
      )
    }

    const dataSource = await initializeDatabase()
    const agencyRepository = dataSource.getRepository(Agency)
    const agency = await agencyRepository.findOne({ where: { id: agencyId } })

    if (!agency) {
      return NextResponse.json({ error: 'Agency bulunamadı' }, { status: 404 })
    }

    if (taxRate !== undefined) {
      agency.taxRate = Number(taxRate) || 0
    }
    if (defaultCurrency) {
      agency.defaultCurrency = defaultCurrency
    }

    await agencyRepository.save(agency)

    return NextResponse.json({ 
      success: true, 
      message: 'Fatura ayarları başarıyla güncellendi',
      agency: {
        id: agency.id,
        taxRate: agency.taxRate,
        defaultCurrency: agency.defaultCurrency,
      }
    })
  } catch (error: any) {
    console.error('Error updating agency settings:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack?.substring(0, 500)
    })
    return NextResponse.json(
      { 
        error: 'Ayarlar güncellenemedi',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
