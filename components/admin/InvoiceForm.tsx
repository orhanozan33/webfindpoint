'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
}

interface InvoiceFormProps {
  invoice?: {
    id: string
    clientId: string
    projectId?: string
    issueDate: Date | string
    dueDate: Date | string
    subtotal: number
    tax: number
    total: number
    currency: string
    status: string
    notes?: string
    items?: InvoiceItem[]
  }
  clients: Array<{
    id: string
    name: string
    companyName?: string
    email: string
  }>
  projects: Array<{
    id: string
    name: string
    clientId: string
  }>
  defaultTaxRate?: number
  defaultCurrency?: string
}

export function InvoiceForm({ invoice, clients, projects, defaultTaxRate = 0, defaultCurrency = 'CAD' }: InvoiceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    clientId: invoice?.clientId || '',
    projectId: invoice?.projectId || '',
    issueDate: invoice?.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: invoice?.currency || defaultCurrency,
    tax: invoice?.tax?.toString() || defaultTaxRate.toString(),
    notes: invoice?.notes || '',
    status: invoice?.status || 'draft',
  })

  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.items && invoice.items.length > 0
      ? invoice.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      : [{ description: '', quantity: 1, unitPrice: 0 }]
  )

  const filteredProjects = formData.clientId
    ? projects.filter(p => p.clientId === formData.clientId)
    : []

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0
      const unitPrice = Number(item.unitPrice) || 0
      return sum + (quantity * unitPrice)
    }, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = Number(formData.tax) || 0
    return subtotal + tax
  }

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.clientId) {
      setError('Müşteri seçilmelidir')
      setLoading(false)
      return
    }

    if (items.length === 0 || items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      setError('En az bir geçerli fatura kalemi eklenmelidir')
      setLoading(false)
      return
    }

    try {
      const subtotal = calculateSubtotal()
      const tax = Number(formData.tax) || 0
      const total = subtotal + tax

      const url = invoice
        ? `/api/admin/invoices/${invoice.id}`
        : '/api/admin/invoices'
      const method = invoice ? 'PUT' : 'POST'

      const payload = {
        clientId: formData.clientId,
        projectId: formData.projectId || undefined,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        items: items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
        tax,
        currency: formData.currency,
        notes: formData.notes || undefined,
        subtotal,
        total,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok || response.status === 201) {
        router.push('/admin/invoices')
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Fatura kaydedilemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
      console.error('Invoice form error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 md:p-8 border border-neutral-200 space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm"
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="md:col-span-2">
          <label htmlFor="clientId" className="block text-sm font-semibold text-neutral-700 mb-2">
            Müşteri *
          </label>
          <select
            id="clientId"
            value={formData.clientId}
            onChange={(e) => {
              setFormData({ ...formData, clientId: e.target.value, projectId: '' })
            }}
            required
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="">Müşteri Seçin</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} {client.companyName ? `(${client.companyName})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="projectId" className="block text-sm font-semibold text-neutral-700 mb-2">
            Proje (Opsiyonel)
          </label>
          <select
            id="projectId"
            value={formData.projectId}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            disabled={!formData.clientId || filteredProjects.length === 0}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none disabled:bg-neutral-100 disabled:cursor-not-allowed"
          >
            <option value="">Proje Seçin</option>
            {filteredProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="issueDate" className="block text-sm font-semibold text-neutral-700 mb-2">
            Düzenleme Tarihi *
          </label>
          <input
            type="date"
            id="issueDate"
            value={formData.issueDate}
            onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-semibold text-neutral-700 mb-2">
            Vade Tarihi *
          </label>
          <input
            type="date"
            id="dueDate"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
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
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="CAD">CAD</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="TRY">TRY</option>
          </select>
        </div>

        <div>
          <label htmlFor="tax" className="block text-sm font-semibold text-neutral-700 mb-2">
            Vergi / Ek Ücret
          </label>
          <input
            type="number"
            id="tax"
            step="0.01"
            min="0"
            value={formData.tax}
            onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
            className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
      </div>

      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-semibold text-neutral-700">
            Fatura Kalemleri *
          </label>
          <motion.button
            type="button"
            onClick={addItem}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
          >
            + Kalem Ekle
          </motion.button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200"
            >
              <div className="md:col-span-5">
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Açıklama
                </label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  required
                  placeholder="Hizmet veya ürün açıklaması"
                  className="w-full px-3 py-2 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Miktar
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', Number(e.target.value) || 1)}
                  required
                  className="w-full px-3 py-2 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Birim Fiyat
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value) || 0)}
                  required
                  className="w-full px-3 py-2 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                />
              </div>
              <div className="md:col-span-1 flex items-end">
                {items.length > 1 && (
                  <motion.button
                    type="button"
                    onClick={() => removeItem(index)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-full px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm font-semibold"
                  >
                    ✕
                  </motion.button>
                )}
              </div>
              <div className="md:col-span-12 text-right">
                <span className="text-sm text-neutral-600">
                  Ara Toplam: <span className="font-semibold text-neutral-900">
                    {formData.currency} {(Number(item.quantity) * Number(item.unitPrice)).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                  </span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-neutral-700">Ara Toplam:</span>
            <span className="text-lg font-bold text-neutral-900">
              {formData.currency} {calculateSubtotal().toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-neutral-700">Vergi / Ek Ücret:</span>
            <span className="text-lg font-bold text-neutral-900">
              {formData.currency} {Number(formData.tax || 0).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-primary-200">
            <span className="text-base font-bold text-neutral-900">Toplam:</span>
            <span className="text-2xl font-bold text-primary-600">
              {formData.currency} {calculateTotal().toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
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
          className="w-full px-4 py-3 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
          placeholder="Fatura ile ilgili ek notlar..."
        />
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-neutral-200">
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Kaydediliyor...' : invoice ? 'Güncelle' : 'Fatura Oluştur'}
        </motion.button>
        <motion.button
          type="button"
          onClick={() => router.back()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-neutral-200 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-300 transition-colors"
        >
          İptal
        </motion.button>
      </div>
    </form>
  )
}
