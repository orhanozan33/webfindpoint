import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/database'
import { Contact } from '@/entities/Contact'

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
    const contactRepository = dataSource.getRepository(Contact)
    
    const contact = await contactRepository.findOne({ where: { id } })

    if (!contact) {
      return NextResponse.json({ error: 'İletişim mesajı bulunamadı' }, { status: 404 })
    }

    await contactRepository.remove(contact)

    return NextResponse.json({ success: true, message: 'Mesaj başarıyla silindi' })
  } catch (error: any) {
    console.error('Error deleting contact:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack?.substring(0, 500)
    })
    return NextResponse.json(
      { 
        error: 'Mesaj silinemedi',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
