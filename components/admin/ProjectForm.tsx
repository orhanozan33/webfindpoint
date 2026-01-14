'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Project } from '@/entities/Project'
import { Client } from '@/entities/Client'

interface ProjectFormProps {
  project?: {
    id: string
    name: string
    description?: string
    type: string
    clientId: string
    startDate?: Date | string
    deliveryDate?: Date | string
    status: string
    price?: number
    currency: string
  }
  clients: Array<{
    id: string
    name: string
    companyName?: string
    email: string
  }>
}

export function ProjectForm({ project, clients }: ProjectFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    type: project?.type || 'website',
    clientId: project?.clientId || '',
    startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
    deliveryDate: project?.deliveryDate ? new Date(project.deliveryDate).toISOString().split('T')[0] : '',
    status: project?.status || 'planning',
    price: project?.price?.toString() || '',
    currency: project?.currency || 'CAD',
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = project
        ? `/api/admin/projects/${project.id}`
        : '/api/admin/projects'
      const method = project ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        startDate: formData.startDate || null,
        deliveryDate: formData.deliveryDate || null,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push('/admin/projects')
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Proje kaydedilemedi')
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
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-semibold text-neutral-700 mb-2">
            Proje Adı *
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
          <label htmlFor="clientId" className="block text-sm font-semibold text-neutral-700 mb-2">
            Müşteri *
          </label>
          <select
            id="clientId"
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          >
            <option value="">Müşteri seçin</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} {client.companyName ? `(${client.companyName})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-semibold text-neutral-700 mb-2">
            Proje Tipi *
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          >
            <option value="website">Web Sitesi</option>
            <option value="redesign">Yeniden Tasarım</option>
            <option value="seo">SEO</option>
            <option value="maintenance">Bakım</option>
            <option value="ecommerce">E-Ticaret</option>
            <option value="other">Diğer</option>
          </select>
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-semibold text-neutral-700 mb-2">
            Başlangıç Tarihi
          </label>
          <input
            type="date"
            id="startDate"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          />
        </div>

        <div>
          <label htmlFor="deliveryDate" className="block text-sm font-semibold text-neutral-700 mb-2">
            Teslim Tarihi
          </label>
          <input
            type="date"
            id="deliveryDate"
            value={formData.deliveryDate}
            onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-semibold text-neutral-700 mb-2">
            Durum
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          >
            <option value="planning">Planlama</option>
            <option value="in-progress">Devam Ediyor</option>
            <option value="review">İnceleme</option>
            <option value="completed">Tamamlandı</option>
            <option value="on-hold">Beklemede</option>
          </select>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-semibold text-neutral-700 mb-2">
            Fiyat
          </label>
          <input
            type="number"
            id="price"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
          <label htmlFor="description" className="block text-sm font-semibold text-neutral-700 mb-2">
            Açıklama
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
          {loading ? 'Kaydediliyor...' : project ? 'Projeyi Güncelle' : 'Proje Oluştur'}
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