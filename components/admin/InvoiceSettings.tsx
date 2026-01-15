'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'

interface InvoiceSettingsProps {
  agency: {
    id: string
    taxRate: number
    defaultCurrency: string
  }
}

export function InvoiceSettings({ agency }: InvoiceSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    taxRate: agency.taxRate?.toString() || '0',
    defaultCurrency: agency.defaultCurrency || 'CAD',
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/agencies/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId: agency.id,
          taxRate: Number(formData.taxRate) || 0,
          defaultCurrency: formData.defaultCurrency,
        }),
      })

      if (response.ok) {
        setSuccess('Fatura ayarları başarıyla güncellendi')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Ayarlar güncellenemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
      console.error('Settings update error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 md:p-8 border border-neutral-200"
    >
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">Fatura Ayarları</h2>
      <p className="text-neutral-600 mb-6">Varsayılan fatura ayarlarını yapılandırın</p>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm"
        >
          {success}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label htmlFor="taxRate" className="block text-sm font-semibold text-neutral-700 mb-2">
              Varsayılan Vergi Oranı (%)
            </label>
            <input
              type="number"
              id="taxRate"
              step="0.01"
              min="0"
              max="100"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
              className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="0.00"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Yeni faturalarda varsayılan olarak kullanılacak vergi oranı
            </p>
          </div>

          <div>
            <label htmlFor="defaultCurrency" className="block text-sm font-semibold text-neutral-700 mb-2">
              Varsayılan Para Birimi
            </label>
            <select
              id="defaultCurrency"
              value={formData.defaultCurrency}
              onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
              className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="CAD">CAD - Kanada Doları</option>
              <option value="USD">USD - ABD Doları</option>
              <option value="EUR">EUR - Euro</option>
              <option value="TRY">TRY - Türk Lirası</option>
            </select>
            <p className="mt-1 text-xs text-neutral-500">
              Yeni faturalarda varsayılan olarak kullanılacak para birimi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-neutral-200">
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}
