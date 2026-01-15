import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * API route for uploading images (portfolio and services)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = (formData.get('type') as string) || 'portfolio' // 'portfolio' or 'services'

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Geçersiz dosya tipi. Sadece JPG, PNG, WEBP veya GIF yükleyebilirsiniz.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Dosya boyutu çok büyük. Maksimum 5MB yükleyebilirsiniz.' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', type)
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const filename = `${type}-${timestamp}-${randomString}.${fileExtension}`
    const filepath = join(uploadsDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return the public URL
    const publicUrl = `/uploads/${type}/${filename}`

    return NextResponse.json({ 
      url: publicUrl,
      filename: filename 
    })
  } catch (error: any) {
    console.error('File upload error:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      stack: error?.stack?.substring(0, 500),
      isVercel: !!process.env.VERCEL,
    })
    
    // Check if we're on Vercel (read-only filesystem)
    if (process.env.VERCEL) {
      return NextResponse.json(
        { 
          error: 'Vercel\'de dosya yükleme desteklenmiyor. Lütfen görsel URL\'sini manuel olarak girin veya Cloudinary, AWS S3 gibi bir cloud storage servisi kullanın.',
          details: 'Vercel\'in dosya sistemi read-only olduğu için dosya yazma işlemi yapılamaz.'
        },
        { status: 500 }
      )
    }
    
    // Check for specific filesystem errors
    if (error?.code === 'EACCES' || error?.code === 'EPERM') {
      return NextResponse.json(
        { 
          error: 'Dosya yazma izni yok. Lütfen uploads klasörünün yazılabilir olduğundan emin olun.',
          details: error?.message
        },
        { status: 500 }
      )
    }
    
    if (error?.code === 'ENOENT') {
      return NextResponse.json(
        { 
          error: 'Dosya yolu bulunamadı.',
          details: error?.message
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Dosya yüklenirken bir hata oluştu',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}
