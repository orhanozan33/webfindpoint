'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface HostingFormProps {
  hosting?: {
    id: string
    provider: string
    plan?: string
    startDate: Date | string
    endDate?: Date | string
    autoRenew: boolean
    monthlyCost?: number
    currency: string
    notes?: string
    projectId?: string
  }
  projects: Array<{
    id: string
    name: string
  }>
}

export function HostingForm({ hosting, projects }: HostingFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    provider: hosting?.provider || '',
    plan: hosting?.plan || '',
    startDate: hosting?.startDate ? new Date(hosting.startDate).toISOString().split('T')[0] : '',
    endDate: hosting?.endDate ? new Date(hosting.endDate).toISOString().split('T')[0] : '',
    autoRenew: hosting?.autoRenew || false,
    monthlyCost: hosting?.monthlyCost?.toString() || '',
    currency: hosting?.currency || 'CAD',
    notes: hosting?.notes || '',
    projectId: hosting?.projectId || '',
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = hosting
        ? `/api/admin/hosting/${hosting.id}`
        : '/api/admin/hosting'
      const method = hosting ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        monthlyCost: formData.monthlyCost ? parseFloat(formData.monthlyCost) : null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        projectId: formData.projectId || null,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push('/admin/hosting')
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Hosting hizmeti kaydedilemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 border border-neutral-200 space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label htmlFor="provider" className="block text-sm font-semibold text-neutral-700 mb-2">
            Sağlayıcı *
          </label>
          <input
            type="text"
            id="provider"
            value={formData.provider}
            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
            placeholder="Örn: Vercel, AWS, DigitalOcean"
          />
        </div>

        <div>
          <label htmlFor="plan" className="block text-sm font-semibold text-neutral-700 mb-2">
            Plan
          </label>
          <input
            type="text"
            id="plan"
            value={formData.plan}
            onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
            placeholder="Örn: Pro Plan, Basic"
          />
        </div>

        <div>
          <label htmlFor="projectId" className="block text-sm font-semibold text-neutral-700 mb-2">
            Proje
          </label>
          <select
            id="projectId"
            value={formData.projectId}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          >
            <option value="">Proje seçin (opsiyonel)</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-semibold text-neutral-700 mb-2">
            Başlangıç Tarihi *
          </label>
          <input
            type="date"
            id="startDate"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-semibold text-neutral-700 mb-2">
            Bitiş Tarihi
          </label>
          <input
            type="date"
            id="endDate"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          />
        </div>

        <div>
          <label htmlFor="monthlyCost" className="block text-sm font-semibold text-neutral-700 mb-2">
            Aylık Maliyet
          </label>
          <input
            type="number"
            id="monthlyCost"
            step="0.01"
            value={formData.monthlyCost}
            onChange={(e) => setFormData({ ...formData, monthlyCost: e.target.value })}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          />
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-semibold text-neutral-700 mb-2">
            Para Birimi
          </label>
          <select
            id="currency"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          >
            <option value="CAD">CAD</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.autoRenew}
              onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
              className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-semibold text-neutral-700">Otomatik Yenileme</span>
          </label>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-semibold text-neutral-700 mb-2">
            Notlar
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : hosting ? 'Hosting Hizmetini Güncelle' : 'Hosting Hizmeti Oluştur'}
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
