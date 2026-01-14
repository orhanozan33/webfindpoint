'use client'

import { useState, FormEvent, useEffect } from 'react'

interface ServiceImage {
  webDesign: string
  uiux: string
  development: string
  optimization: string
}

export function SettingsForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({})
  const [initializing, setInitializing] = useState(true)

  // Default image paths from messages
  const [serviceImages, setServiceImages] = useState<ServiceImage>({
    webDesign: '/uploads/services/web-design.jpg',
    uiux: '/uploads/services/ui-ux.jpg',
    development: '/uploads/services/development.jpg',
    optimization: '/uploads/services/optimization.jpg',
  })

  // Fetch current service images on mount
  useEffect(() => {
    const fetchServiceImages = async () => {
      try {
        const response = await fetch('/api/admin/settings/services')
        if (response.ok) {
          const data = await response.json()
          setServiceImages(data)
        }
      } catch (err) {
        console.error('Error fetching service images:', err)
      } finally {
        setInitializing(false)
      }
    }

    fetchServiceImages()
  }, [])

  const handleFileUpload = async (serviceKey: keyof ServiceImage, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading((prev) => ({ ...prev, [serviceKey]: true }))
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'services')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setServiceImages((prev) => ({
          ...prev,
          [serviceKey]: data.url,
        }))
        setSuccess(`${serviceKey} için resim yüklendi!`)
      } else {
        const data = await response.json()
        setError(data.error || 'Dosya yüklenemedi')
      }
    } catch (err) {
      setError('Dosya yüklenirken bir hata oluştu')
      console.error('Upload error:', err)
    } finally {
      setUploading((prev) => ({ ...prev, [serviceKey]: false }))
      e.target.value = ''
    }
  }

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/settings/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceImages),
      })

      if (response.ok) {
        setSuccess('Ayarlar başarıyla kaydedildi!')
      } else {
        const data = await response.json()
        setError(data.error || 'Ayarlar kaydedilemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
      console.error('Save error:', err)
    } finally {
      setLoading(false)
    }
  }

  const serviceLabels: { [key in keyof ServiceImage]: string } = {
    webDesign: 'Web Tasarımı',
    uiux: 'UI/UX Tasarımı',
    development: 'Özel Geliştirme',
    optimization: 'Performans Optimizasyonu',
  }

  if (initializing) {
    return (
      <div className="bg-white rounded-xl p-8 border border-neutral-200">
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-600">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-xl p-4 md:p-6 border border-neutral-200 space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          {success}
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-neutral-900 mb-3">Hizmet Görselleri</h2>
        <div className="space-y-3">
          {(Object.keys(serviceImages) as Array<keyof ServiceImage>).map((serviceKey) => (
            <div key={serviceKey} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-neutral-900 mb-0.5">
                    {serviceLabels[serviceKey]}
                  </h3>
                  <p className="text-xs text-neutral-600">
                    {serviceKey === 'webDesign' && 'Web tasarımı hizmeti için görsel'}
                    {serviceKey === 'uiux' && 'UI/UX tasarımı hizmeti için görsel'}
                    {serviceKey === 'development' && 'Özel geliştirme hizmeti için görsel'}
                    {serviceKey === 'optimization' && 'Performans optimizasyonu hizmeti için görsel'}
                  </p>
                </div>
                <label
                  htmlFor={`file-upload-${serviceKey}`}
                  className={`ml-3 px-3 py-1.5 text-sm bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors cursor-pointer ${
                    uploading[serviceKey] ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading[serviceKey] ? 'Yükleniyor...' : '📁 Yükle'}
                </label>
                <input
                  type="file"
                  id={`file-upload-${serviceKey}`}
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={(e) => handleFileUpload(serviceKey, e)}
                  disabled={uploading[serviceKey]}
                  className="hidden"
                />
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Görsel URL
                </label>
                <input
                  type="text"
                  value={serviceImages[serviceKey]}
                  onChange={(e) =>
                    setServiceImages((prev) => ({
                      ...prev,
                      [serviceKey]: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
                  placeholder="/uploads/services/web-design.jpg"
                />
              </div>

              {serviceImages[serviceKey] && (
                <div className="mt-3">
                  <div className="aspect-[4/3] max-h-48 relative overflow-hidden bg-gradient-to-br from-cyan-900/20 via-blue-900/20 to-purple-900/20 rounded-lg border border-cyan-500/20">
                    <img
                      src={serviceImages[serviceKey]}
                      alt={serviceLabels[serviceKey]}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-neutral-200 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">Dökümanlar</h2>
          <div className="border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1">
                  Kullanıcı Sözleşmesi
                </h3>
                <p className="text-xs text-neutral-600">
                  Yaptığımız işlerle ilgili kullanıcı sözleşmesini PDF olarak indirebilirsiniz.
                </p>
              </div>
              <a
                href="/api/admin/terms/download"
                download="kullanim-sozlesmesi.pdf"
                className="px-4 py-2 text-sm bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                PDF İndir
              </a>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-sm bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </button>
        </div>
      </div>
    </form>
  )
}
