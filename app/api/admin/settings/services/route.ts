import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

/**
 * API route for managing service images in settings
 */
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Read messages files to get current image URLs
    const messagesPath = join(process.cwd(), 'messages', 'tr.json')
    const messages = JSON.parse(await readFile(messagesPath, 'utf-8'))

    const serviceImages = {
      webDesign: messages.services?.webDesign?.image || '/uploads/services/web-design.jpg',
      uiux: messages.services?.uiux?.image || '/uploads/services/ui-ux.jpg',
      development: messages.services?.development?.image || '/uploads/services/development.jpg',
      optimization: messages.services?.optimization?.image || '/uploads/services/optimization.jpg',
    }

    return NextResponse.json(serviceImages)
  } catch (error) {
    console.error('Error reading service images:', error)
    return NextResponse.json(
      { error: 'Hizmet görselleri okunamadı' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { webDesign, uiux, development, optimization } = body

    // Update all three language files
    const locales = ['tr', 'en', 'fr']

    for (const locale of locales) {
      const messagesPath = join(process.cwd(), 'messages', `${locale}.json`)
      const messages = JSON.parse(await readFile(messagesPath, 'utf-8'))

      // Update service images
      if (messages.services) {
        if (messages.services.webDesign) messages.services.webDesign.image = webDesign
        if (messages.services.uiux) messages.services.uiux.image = uiux
        if (messages.services.development) messages.services.development.image = development
        if (messages.services.optimization) messages.services.optimization.image = optimization
      }

      // Write back to file
      await writeFile(messagesPath, JSON.stringify(messages, null, 2), 'utf-8')
    }

    return NextResponse.json({ success: true, message: 'Hizmet görselleri güncellendi' })
  } catch (error) {
    console.error('Error updating service images:', error)
    return NextResponse.json(
      { error: 'Hizmet görselleri güncellenemedi' },
      { status: 500 }
    )
  }
}
