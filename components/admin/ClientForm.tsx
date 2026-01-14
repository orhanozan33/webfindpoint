'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface ClientFormProps {
  client?: {
    id: string
    name: string
    companyName?: string
    email: string
    phone?: string
    notes?: string
    status: string
  }
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: client?.name || '',
    companyName: client?.companyName || '',
    email: client?.email || '',
    phone: client?.phone || '',
    notes: client?.notes || '',
    status: client?.status || 'active',
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = client
        ? `/api/admin/clients/${client.id}`
        : '/api/admin/clients'
      const method = client ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/admin/clients')
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Müşteri kaydedilemedi')
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
          <label htmlFor="name" className="block text-sm font-semibold text-neutral-700 mb-2">
            Ad Soyad *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          />
        </div>

        <div>
          <label htmlFor="companyName" className="block text-sm font-semibold text-neutral-700 mb-2">
            Şirket Adı
          </label>
          <input
            type="text"
            id="companyName"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
            E-posta *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-neutral-700 mb-2">
            Telefon
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="status" className="block text-sm font-semibold text-neutral-700 mb-2">
            Durum
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          >
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-semibold text-neutral-700 mb-2">
            Notlar
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
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
          {loading ? 'Kaydediliyor...' : client ? 'Müşteriyi Güncelle' : 'Müşteri Oluştur'}
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