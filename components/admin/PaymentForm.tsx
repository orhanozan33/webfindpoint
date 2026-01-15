'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Payment } from '@/entities/Payment'
import { Project } from '@/entities/Project'

interface PaymentFormProps {
  payment?: {
    id: string
    projectId: string
    amount: number
    currency: string
    status: string
    paymentDate?: Date | string
    notes?: string
  }
  projects: Array<{
    id: string
    name: string
    client?: {
      id: string
      name: string
    } | null
  }>
}

export function PaymentForm({ payment, projects }: PaymentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    projectId: payment?.projectId || '',
    amount: payment?.amount?.toString() || '',
    currency: payment?.currency || 'CAD',
    status: payment?.status || 'unpaid',
    paymentDate: payment?.paymentDate
      ? new Date(payment.paymentDate).toISOString().split('T')[0]
      : '',
    notes: payment?.notes || '',
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = payment
        ? `/api/admin/payments/${payment.id}`
        : '/api/admin/payments'
      const method = payment ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        paymentDate: formData.paymentDate || null,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok || response.status === 201) {
        router.push('/admin/payments')
        router.refresh()
      } else {
        try {
          const data = await response.json()
          console.error('Payment form error:', data)
          setError(data.error || 'Ödeme kaydedilemedi')
        } catch (parseError) {
          console.error('Payment form error (no JSON body):', response.status, response.statusText)
          setError(`Ödeme kaydedilemedi: ${response.status} ${response.statusText}`)
        }
      }
    } catch (err) {
      console.error('Payment form network error:', err)
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
          <label htmlFor="projectId" className="block text-sm font-semibold text-neutral-700 mb-2">
            Proje *
          </label>
          <select
            id="projectId"
            value={formData.projectId}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          >
            <option value="">Proje seçin</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} - {project.client?.name || 'Müşteri yok'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-semibold text-neutral-700 mb-2">
            Tutar *
          </label>
          <input
            type="number"
            id="amount"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
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
            <option value="paid">Ödendi</option>
            <option value="partial">Kısmi</option>
            <option value="unpaid">Ödenmedi</option>
          </select>
        </div>

        <div>
          <label htmlFor="paymentDate" className="block text-sm font-semibold text-neutral-700 mb-2">
            Ödeme Tarihi
          </label>
          <input
            type="date"
            id="paymentDate"
            value={formData.paymentDate}
            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none placeholder:text-neutral-400"
          />
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
          {loading ? 'Kaydediliyor...' : payment ? 'Ödemeyi Güncelle' : 'Ödeme Oluştur'}
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