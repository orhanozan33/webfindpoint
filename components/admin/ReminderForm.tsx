'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface ReminderFormProps {
  reminder?: {
    id: string
    type: string
    title: string
    description?: string
    dueDate: Date | string
    daysBeforeReminder: number
    relatedEntityType?: string
    relatedEntityId?: string
    isCompleted: boolean
  }
}

export function ReminderForm({ reminder }: ReminderFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    type: reminder?.type || 'custom',
    title: reminder?.title || '',
    description: reminder?.description || '',
    dueDate: reminder?.dueDate ? new Date(reminder.dueDate).toISOString().split('T')[0] : '',
    daysBeforeReminder: reminder?.daysBeforeReminder?.toString() || '30',
    relatedEntityType: reminder?.relatedEntityType || '',
    relatedEntityId: reminder?.relatedEntityId || '',
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = reminder
        ? `/api/admin/reminders/${reminder.id}`
        : '/api/admin/reminders'
      const method = reminder ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        daysBeforeReminder: parseInt(formData.daysBeforeReminder) || 30,
        relatedEntityType: formData.relatedEntityType || null,
        relatedEntityId: formData.relatedEntityId || null,
        isCompleted: reminder?.isCompleted || false,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok || response.status === 201) {
        router.push('/admin/reminders')
        router.refresh()
      } else {
        try {
          const data = await response.json()
          console.error('Reminder form error:', data)
          setError(data.error || 'Hatırlatıcı kaydedilemedi')
        } catch (parseError) {
          console.error('Reminder form error (no JSON body):', response.status, response.statusText)
          setError(`Hatırlatıcı kaydedilemedi: ${response.status} ${response.statusText}`)
        }
      }
    } catch (err) {
      console.error('Reminder form network error:', err)
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
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-semibold text-neutral-700 mb-2">
            Başlık *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
            placeholder="Örn: Hosting yenileme, Ödeme vadesi"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-semibold text-neutral-700 mb-2">
            Tip *
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          >
            <option value="hosting_expiration">Hosting Bitişi</option>
            <option value="service_renewal">Hizmet Yenileme</option>
            <option value="payment_due">Ödeme Vadesi</option>
            <option value="custom">Özel</option>
          </select>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-semibold text-neutral-700 mb-2">
            Bitiş Tarihi *
          </label>
          <input
            type="date"
            id="dueDate"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          />
        </div>

        <div>
          <label htmlFor="daysBeforeReminder" className="block text-sm font-semibold text-neutral-700 mb-2">
            Kaç Gün Önce Hatırlat (Gün) *
          </label>
          <input
            type="number"
            id="daysBeforeReminder"
            value={formData.daysBeforeReminder}
            onChange={(e) => setFormData({ ...formData, daysBeforeReminder: e.target.value })}
            required
            min="1"
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          />
        </div>

        <div>
          <label htmlFor="relatedEntityType" className="block text-sm font-semibold text-neutral-700 mb-2">
            İlişkili Varlık Tipi
          </label>
          <select
            id="relatedEntityType"
            value={formData.relatedEntityType}
            onChange={(e) => setFormData({ ...formData, relatedEntityType: e.target.value })}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          >
            <option value="">Yok</option>
            <option value="project">Proje</option>
            <option value="client">Müşteri</option>
            <option value="hosting">Hosting</option>
          </select>
        </div>

        <div>
          <label htmlFor="relatedEntityId" className="block text-sm font-semibold text-neutral-700 mb-2">
            İlişkili Varlık ID
          </label>
          <input
            type="text"
            id="relatedEntityId"
            value={formData.relatedEntityId}
            onChange={(e) => setFormData({ ...formData, relatedEntityId: e.target.value })}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
            placeholder="UUID (opsiyonel)"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-semibold text-neutral-700 mb-2">
            Açıklama
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none placeholder:text-neutral-400"
            placeholder="Hatırlatıcı hakkında detaylı bilgi..."
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : reminder ? 'Hatırlatıcıyı Güncelle' : 'Hatırlatıcı Oluştur'}
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
