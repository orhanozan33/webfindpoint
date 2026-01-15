'use client'

import { useState, FormEvent, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface PortfolioFormProps {
  portfolio?: {
    id: string
    title: string
    titleFr?: string
    titleTr?: string
    description: string
    descriptionFr?: string
    descriptionTr?: string
    category?: string
    technologies?: string[]
    image?: string
    projectUrl?: string
    isActive: boolean
    sortOrder: number
  }
}

export function PortfolioForm({ portfolio }: PortfolioFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [techInput, setTechInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [translating, setTranslating] = useState(false)
  const translateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Normalize technologies to array
  const normalizeTechnologies = (techs: any): string[] => {
    if (!techs) return []
    if (Array.isArray(techs)) return techs
    if (typeof techs === 'string') {
      // Handle comma-separated string
      return techs.split(',').map(t => t.trim()).filter(t => t.length > 0)
    }
    return []
  }

  const [formData, setFormData] = useState({
    title: portfolio?.title || '',
    titleFr: portfolio?.titleFr || '',
    titleTr: portfolio?.titleTr || '',
    description: portfolio?.description || '',
    descriptionFr: portfolio?.descriptionFr || '',
    descriptionTr: portfolio?.descriptionTr || '',
    category: portfolio?.category || '',
    technologies: normalizeTechnologies(portfolio?.technologies),
    image: portfolio?.image || '',
    projectUrl: portfolio?.projectUrl || '',
    isActive: portfolio?.isActive !== undefined ? portfolio.isActive : true,
    sortOrder: portfolio?.sortOrder?.toString() || '0',
  })

  const addTechnology = () => {
    const techs = formData.technologies || []
    if (techInput.trim() && !techs.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technologies: [...techs, techInput.trim()],
      })
      setTechInput('')
    }
  }

  const removeTechnology = (tech: string) => {
    const techs = formData.technologies || []
    setFormData({
      ...formData,
      technologies: techs.filter((t) => t !== tech),
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (response.ok || response.status === 201) {
        const data = await response.json()
        // Use functional update to avoid closure issues
        setFormData((prev) => ({
          ...prev,
          image: data.url,
        }))
      } else {
        try {
          const data = await response.json()
          setError(data.error || data.details || 'Dosya yüklenemedi')
        } catch (parseError) {
          setError(`Dosya yüklenemedi: ${response.status} ${response.statusText}`)
        }
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err?.message || 'Dosya yüklenirken bir hata oluştu')
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = portfolio
        ? `/api/admin/portfolio/${portfolio.id}`
        : '/api/admin/portfolio'
      const method = portfolio ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        sortOrder: parseInt(formData.sortOrder) || 0,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok || response.status === 201) {
        router.push('/admin/portfolio')
        router.refresh()
      } else {
        try {
          const data = await response.json()
          console.error('Portfolio form error:', data)
          setError(data.error || 'Portföy öğesi kaydedilemedi')
        } catch (parseError) {
          console.error('Portfolio form error (no JSON body):', response.status, response.statusText)
          setError(`Portföy öğesi kaydedilemedi: ${response.status} ${response.statusText}`)
        }
      }
    } catch (err: any) {
      console.error('Portfolio form network error:', err)
      setError(err?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-fill EN and FR when TR is filled (with translation)
  const handleTitleTrChange = useCallback((value: string) => {
    // Update TR title immediately
    setFormData((prev) => ({
      ...prev,
      titleTr: value,
    }))

    // Clear previous timeout
    if (translateTimeoutRef.current) {
      clearTimeout(translateTimeoutRef.current)
    }

    // If empty, clear EN and FR
    if (!value.trim()) {
      setFormData((prev) => ({
        ...prev,
        titleTr: value,
        title: '',
        titleFr: '',
      }))
      return
    }

    // Debounce translation: wait 800ms after user stops typing
    translateTimeoutRef.current = setTimeout(async () => {
      setTranslating(true)
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: value }),
        })

        if (response.ok) {
          const data = await response.json()
          const { en, fr, warning, error: apiError } = data
          
          // Show warning/error message
          if (warning) {
            setError(`⚠️ ${warning}`)
          } else if (apiError) {
            setError(`⚠️ ${apiError}`)
          }
          
          // Check if translations are different from TR (actual translations received)
          if (en && en !== value && fr && fr !== value) {
            // Real translations received
            setFormData((prev) => ({
              ...prev,
              titleTr: value,
              title: en,
              titleFr: fr,
            }))
            if (!warning && !apiError) {
              setError('') // Clear errors only if no warning
            }
          } else {
            // Translation API returned same text or empty - likely API keys missing
            if (!warning && !apiError) {
              setError('⚠️ Çeviri yapılamadı. EN ve FR alanlarını manuel doldurun. API key eklemek için: .env.local dosyasına DEEPL_API_KEY veya GOOGLE_TRANSLATE_API_KEY ekleyin.')
            }
            setFormData((prev) => ({
              ...prev,
              titleTr: value,
              // Don't overwrite EN and FR if translation failed
            }))
          }
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('Translation API error:', errorData)
          setError('⚠️ Çeviri başarısız oldu. EN ve FR alanlarını manuel doldurun.')
          // Don't overwrite existing EN and FR values
          setFormData((prev) => ({
            ...prev,
            titleTr: value,
          }))
        }
      } catch (error) {
        console.error('Translation error:', error)
        setError('⚠️ Çeviri başarısız oldu. EN ve FR alanlarını manuel doldurun.')
        // Don't overwrite existing EN and FR values
        setFormData((prev) => ({
          ...prev,
          titleTr: value,
        }))
      } finally {
        setTranslating(false)
      }
    }, 800) // 800ms debounce
  }, [])

  const handleDescriptionTrChange = useCallback((value: string) => {
    // Update TR description immediately
    setFormData((prev) => ({
      ...prev,
      descriptionTr: value,
    }))

    // Clear previous timeout
    if (translateTimeoutRef.current) {
      clearTimeout(translateTimeoutRef.current)
    }

    // If empty, clear EN and FR
    if (!value.trim()) {
      setFormData((prev) => ({
        ...prev,
        descriptionTr: value,
        description: '',
        descriptionFr: '',
      }))
      return
    }

    // Debounce translation: wait 1000ms after user stops typing (longer for descriptions)
    translateTimeoutRef.current = setTimeout(async () => {
      setTranslating(true)
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: value }),
        })

        if (response.ok) {
          const data = await response.json()
          const { en, fr, warning, error: apiError } = data
          
          // Show warning/error message
          if (warning) {
            setError(`⚠️ ${warning}`)
          } else if (apiError) {
            setError(`⚠️ ${apiError}`)
          }
          
          // Check if translations are different from TR (actual translations received)
          if (en && en !== value && fr && fr !== value) {
            // Real translations received
            setFormData((prev) => ({
              ...prev,
              descriptionTr: value,
              description: en,
              descriptionFr: fr,
            }))
            if (!warning && !apiError) {
              setError('') // Clear errors only if no warning
            }
          } else {
            // Translation API returned same text or empty - likely API keys missing
            if (!warning && !apiError) {
              setError('⚠️ Çeviri yapılamadı. EN ve FR alanlarını manuel doldurun. API key eklemek için: .env.local dosyasına DEEPL_API_KEY veya GOOGLE_TRANSLATE_API_KEY ekleyin.')
            }
            setFormData((prev) => ({
              ...prev,
              descriptionTr: value,
              // Don't overwrite EN and FR if translation failed
            }))
          }
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('Translation API error:', errorData)
          setError('⚠️ Çeviri başarısız oldu. EN ve FR alanlarını manuel doldurun.')
          // Don't overwrite existing EN and FR values
          setFormData((prev) => ({
            ...prev,
            descriptionTr: value,
          }))
        }
      } catch (error) {
        console.error('Translation error:', error)
        setError('⚠️ Çeviri başarısız oldu. EN ve FR alanlarını manuel doldurun.')
        // Don't overwrite existing EN and FR values
        setFormData((prev) => ({
          ...prev,
          descriptionTr: value,
        }))
      } finally {
        setTranslating(false)
      }
    }, 1000) // 1000ms debounce for descriptions
  }, [])

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 border border-neutral-200 space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-semibold text-neutral-700 mb-2">
            Başlık (EN) *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
            placeholder="Örn: E-Commerce Platform"
          />
        </div>

        <div>
          <label htmlFor="titleFr" className="block text-sm font-semibold text-neutral-700 mb-2">
            Başlık (FR)
          </label>
          <input
            type="text"
            id="titleFr"
            value={formData.titleFr}
            onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          />
        </div>

        <div>
          <label htmlFor="titleTr" className="block text-sm font-semibold text-neutral-700 mb-2">
            Başlık (TR) {translating && <span className="text-xs text-primary-600">(Çevriliyor...)</span>}
          </label>
          <input
            type="text"
            id="titleTr"
            value={formData.titleTr}
            onChange={(e) => handleTitleTrChange(e.target.value)}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
            placeholder="Türkçe başlık yazın, EN ve FR otomatik çevrilecek"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-semibold text-neutral-700 mb-2">
            Açıklama (EN) *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={3}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none placeholder:text-neutral-400"
            placeholder="Örn: Modern e-commerce solution with seamless checkout experience."
          />
        </div>

        <div>
          <label htmlFor="descriptionFr" className="block text-sm font-semibold text-neutral-700 mb-2">
            Açıklama (FR)
          </label>
          <textarea
            id="descriptionFr"
            value={formData.descriptionFr}
            onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none placeholder:text-neutral-400"
          />
        </div>

        <div>
          <label htmlFor="descriptionTr" className="block text-sm font-semibold text-neutral-700 mb-2">
            Açıklama (TR) {translating && <span className="text-xs text-primary-600">(Çevriliyor...)</span>}
          </label>
          <textarea
            id="descriptionTr"
            value={formData.descriptionTr}
            onChange={(e) => handleDescriptionTrChange(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none placeholder:text-neutral-400"
            placeholder="Türkçe açıklama yazın, EN ve FR otomatik çevrilecek"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-neutral-700 mb-2">
            Kategori
          </label>
          <input
            type="text"
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
            placeholder="Örn: E-COMMERCE, CORPORATE, SAAS"
          />
        </div>

        <div>
          <label htmlFor="sortOrder" className="block text-sm font-semibold text-neutral-700 mb-2">
            Sıralama
          </label>
          <input
            type="number"
            id="sortOrder"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="technologies" className="block text-sm font-semibold text-neutral-700 mb-2">
            Teknolojiler
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              id="technologies"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTechnology()
                }
              }}
              className="flex-1 px-4 py-2 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
              placeholder="Teknoloji ekle (örn: Next.js)"
            />
            <button
              type="button"
              onClick={addTechnology}
              className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              Ekle
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(formData.technologies || []).map((tech, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold flex items-center gap-2"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => removeTechnology(tech)}
                  className="text-primary-700 hover:text-primary-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-semibold text-neutral-700 mb-2">
            Görsel URL
          </label>
          <input
            type="text"
            id="image"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-neutral-900 bg-white mb-2"
            placeholder="https://example.com/image.jpg veya /uploads/portfolio/image.jpg"
          />
          <div className="flex items-center gap-2">
            <label
              htmlFor="file-upload"
              className={`px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors cursor-pointer ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? 'Yükleniyor...' : '📁 Dosya Yükle'}
            </label>
            <input
              type="file"
              id="file-upload"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
            {formData.image && (
              <span className="text-sm text-neutral-600">
                ✓ Görsel seçildi
              </span>
            )}
          </div>
          {formData.image && (
            <div className="mt-3">
              <img
                src={formData.image}
                alt="Preview"
                className="max-w-full h-32 object-contain border border-neutral-300 rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="projectUrl" className="block text-sm font-semibold text-neutral-700 mb-2">
            Proje URL
          </label>
          <input
            type="url"
            id="projectUrl"
            value={formData.projectUrl}
            onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
            placeholder="https://example.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-semibold text-neutral-700">Aktif (Herkese açık sitede göster)</span>
          </label>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : portfolio ? 'Portföy Öğesini Güncelle' : 'Portföy Öğesi Oluştur'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-neutral-100 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-200 transition-colors"
        >
          İptal
        </button>
      </div>
    </form>
  )
}
