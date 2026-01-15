import { NextRequest, NextResponse } from 'next/server'
import { authorize } from '@/lib/auth/authorize'
import PDFDocument from 'pdfkit'

export async function GET(request: NextRequest) {
  const auth = await authorize(request, { requiredPermission: 'canManageSettings' })
  if (!auth.authorized) {
    return auth.response!
  }

  try {
    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    
    // Collect PDF chunks
    const chunks: Uint8Array[] = []
    
    // Set up event listeners before adding content
    const pdfPromise = new Promise<Uint8Array>((resolve, reject) => {
      doc.on('data', (chunk: Buffer) => {
        chunks.push(new Uint8Array(chunk))
      })
      
      doc.on('end', () => {
        // Combine all chunks into a single Uint8Array
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
        const combined = new Uint8Array(totalLength)
        let offset = 0
        for (const chunk of chunks) {
          combined.set(chunk, offset)
          offset += chunk.length
        }
        resolve(combined)
      })
      
      doc.on('error', (error: Error) => {
        reject(error)
      })
    })

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('KULLANICI SÖZLEŞMESİ', { align: 'center' })
    doc.moveDown(2)

    // Company Info
    doc.fontSize(14).font('Helvetica-Bold').text('FindPoint Digital Agency', { align: 'center' })
    doc.fontSize(10).font('Helvetica').text('Web Tasarım ve Geliştirme Hizmetleri', { align: 'center' })
    doc.moveDown(2)

    // Date
    const currentDate = new Date().toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    doc.fontSize(10).text(`Tarih: ${currentDate}`, { align: 'right' })
    doc.moveDown(2)

    // Introduction
    doc.fontSize(11).font('Helvetica-Bold').text('1. GENEL HÜKÜMLER', { continued: false })
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica').text(
      'Bu kullanıcı sözleşmesi, FindPoint Digital Agency (bundan böyle "Şirket" olarak anılacaktır) ile hizmet alan müşteriler (bundan böyle "Kullanıcı" olarak anılacaktır) arasındaki hizmet ilişkisini düzenlemektedir. Bu sözleşmeyi kabul ederek, kullanıcı aşağıdaki şartları kabul etmiş sayılır.',
      { align: 'justify' }
    )
    doc.moveDown(1.5)

    // Section 2
    doc.fontSize(11).font('Helvetica-Bold').text('2. HİZMET KAPSAMI', { continued: false })
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica').text('Şirket, aşağıdaki hizmetleri sunmaktadır:', { continued: false })
    doc.moveDown(0.5)
    doc.fontSize(10).text('• Web sitesi tasarımı ve geliştirmesi', { indent: 20 })
    doc.text('• UI/UX tasarım hizmetleri', { indent: 20 })
    doc.text('• Özel yazılım geliştirme', { indent: 20 })
    doc.text('• Performans optimizasyonu', { indent: 20 })
    doc.text('• Hosting ve domain yönetimi', { indent: 20 })
    doc.text('• Teknik destek ve bakım hizmetleri', { indent: 20 })
    doc.moveDown(1.5)

    // Section 3
    doc.fontSize(11).font('Helvetica-Bold').text('3. KULLANICI YÜKÜMLÜLÜKLERİ', { continued: false })
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica').text('Kullanıcı, aşağıdaki yükümlülükleri kabul eder:', { continued: false })
    doc.moveDown(0.5)
    doc.fontSize(10).text('• Hizmet bedelini belirlenen sürelerde ödemek', { indent: 20 })
    doc.text('• Gerekli bilgi ve belgeleri zamanında sağlamak', { indent: 20 })
    doc.text('• Şirketin telif haklarına saygı göstermek', { indent: 20 })
    doc.text('• Hizmetleri yasalara aykırı amaçlarla kullanmamak', { indent: 20 })
    doc.text('• Şirketin gizlilik politikasına uymak', { indent: 20 })
    doc.moveDown(1.5)

    // Section 4
    doc.fontSize(11).font('Helvetica-Bold').text('4. ŞİRKET YÜKÜMLÜLÜKLERİ', { continued: false })
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica').text('Şirket, aşağıdaki yükümlülükleri üstlenir:', { continued: false })
    doc.moveDown(0.5)
    doc.fontSize(10).text('• Hizmetleri profesyonel standartlarda sunmak', { indent: 20 })
    doc.text('• Müşteri bilgilerini gizli tutmak', { indent: 20 })
    doc.text('• Belirlenen sürelerde projeleri tamamlamak', { indent: 20 })
    doc.text('• Teknik destek sağlamak', { indent: 20 })
    doc.text('• Kaliteli ve güncel teknolojiler kullanmak', { indent: 20 })
    doc.moveDown(1.5)

    // Section 5
    doc.fontSize(11).font('Helvetica-Bold').text('5. ÖDEME KOŞULLARI', { continued: false })
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica').text(
      'Hizmet bedelleri, proje başlangıcında belirlenen ödeme planına göre tahsil edilir. Ödemeler genellikle proje başlangıcında %50, teslimatta %50 olarak yapılmaktadır. Geciken ödemeler için yasal faiz uygulanabilir.',
      { align: 'justify' }
    )
    doc.moveDown(1.5)

    // Section 6
    doc.fontSize(11).font('Helvetica-Bold').text('6. TELİF HAKLARI', { continued: false })
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica').text(
      'Proje tamamlandıktan ve ödeme yapıldıktan sonra, kullanıcıya proje üzerinde kullanım hakkı verilir. Ancak, tasarım ve kodların kaynak dosyaları, Şirket tarafından portföy amaçlı kullanılabilir. Kullanıcı, projenin tamamlanması ve ödemenin yapılmasından önce telif haklarını devralamaz.',
      { align: 'justify' }
    )
    doc.moveDown(1.5)

    // Section 7
    doc.fontSize(11).font('Helvetica-Bold').text('7. GİZLİLİK', { continued: false })
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica').text(
      'Şirket, kullanıcının kişisel ve ticari bilgilerini gizli tutmayı taahhüt eder. Bu bilgiler, yasal yükümlülükler dışında üçüncü şahıslarla paylaşılmaz. Detaylı bilgi için gizlilik politikamızı inceleyebilirsiniz.',
      { align: 'justify' }
    )
    doc.moveDown(1.5)

    // Section 8
    doc.fontSize(11).font('Helvetica-Bold').text('8. İPTAL VE İADE', { continued: false })
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica').text(
      'Proje başlamadan önce yapılan iptallerde, ödenen tutarın %80\'i iade edilir. Proje başladıktan sonra yapılan iptallerde, tamamlanan iş oranına göre ücretlendirme yapılır ve kalan tutar iade edilir. Tamamlanmış projeler için iade yapılmaz.',
      { align: 'justify' }
    )
    doc.moveDown(1.5)

    // Section 9
    doc.fontSize(11).font('Helvetica-Bold').text('9. SORUMLULUK SINIRLAMASI', { continued: false })
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica').text(
      'Şirket, hizmetlerinde makul özen göstermeyi taahhüt eder. Ancak, kullanıcının verdiği yanlış bilgilerden, üçüncü taraf hizmetlerinden veya kullanıcının hatalı kullanımından kaynaklanan sorunlardan Şirket sorumlu tutulamaz.',
      { align: 'justify' }
    )
    doc.moveDown(1.5)

    // Section 10
    doc.fontSize(11).font('Helvetica-Bold').text('10. UYUŞMAZLIK ÇÖZÜMÜ', { continued: false })
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica').text(
      'Bu sözleşmeden kaynaklanan uyuşmazlıklar öncelikle müzakere yoluyla çözülmeye çalışılır. Çözülemediği takdirde, Türkiye Cumhuriyeti yasaları uygulanır ve uyuşmazlıklar Türkiye mahkemelerinde çözülür.',
      { align: 'justify' }
    )
    doc.moveDown(1.5)

    // Section 11
    doc.fontSize(11).font('Helvetica-Bold').text('11. SÖZLEŞME DEĞİŞİKLİKLERİ', { continued: false })
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica').text(
      'Şirket, bu sözleşmede değişiklik yapma hakkını saklı tutar. Değişiklikler, web sitesinde yayınlandığı tarihten itibaren geçerlidir. Önemli değişiklikler için kullanıcılara bildirim yapılır.',
      { align: 'justify' }
    )
    doc.moveDown(2)

    // Acceptance
    doc.fontSize(11).font('Helvetica-Bold').text('KABUL VE ONAY', { continued: false })
    doc.moveDown(1)
    doc.fontSize(10).font('Helvetica').text(
      'Bu sözleşmeyi okuyup anladım ve yukarıdaki tüm şartları kabul ediyorum. Hizmetlerimizden yararlanarak, bu sözleşmenin hükümlerine bağlı kalmayı taahhüt ediyorum.',
      { align: 'justify' }
    )
    doc.moveDown(2)

    // Footer
    doc.fontSize(9).text('FindPoint Digital Agency', 50, doc.page.height - 80, { align: 'left' })
    doc.text('www.findpoint.com', 50, doc.page.height - 65, { align: 'left' })
    doc.text('İletişim: info@findpoint.com', 50, doc.page.height - 50, { align: 'left' })
    doc.fontSize(8).text(
      'Bu belge elektronik ortamda oluşturulmuştur ve yasal geçerliliğe sahiptir.',
      50,
      doc.page.height - 30,
      { align: 'center', width: 500 }
    )

    // Finalize PDF
    doc.end()

    // Wait for PDF to finish and get buffer
    const pdfBuffer = await pdfPromise

    // Set response headers for PDF download
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', 'attachment; filename="kullanim-sozlesmesi.pdf"')

    // Convert Uint8Array to ArrayBuffer for maximum compatibility
    const arrayBuffer = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength
    )

    // Return PDF as response using standard Response (works with Next.js)
    return new Response(arrayBuffer, { headers })
  } catch (error) {
    console.error('Error generating terms PDF:', error)
    return NextResponse.json({ error: 'PDF oluşturulamadı' }, { status: 500 })
  }
}
