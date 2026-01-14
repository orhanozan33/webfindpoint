'use client'

import { useState, FormEvent } from 'react'
import { Button } from '@/components/Button'

interface ContactFormProps {
  messages: {
    form: {
      name: string
      email: string
      message: string
      submit: string
      sending: string
      success: string
      error: string
    }
  }
}

export function ContactForm({ messages }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('sending')

    // Simulate API call - in production, this would send to your backend
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setStatus('success')
      setFormData({ name: '', email: '', message: '' })
      
      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000)
    } catch (error) {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 border border-neutral-200">
      {status === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {messages.form.success}
        </div>
      )}
      {status === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {messages.form.error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-neutral-700 mb-2">
            {messages.form.name}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            placeholder={messages.form.name}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
            {messages.form.email}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            placeholder={messages.form.email}
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-neutral-700 mb-2">
            {messages.form.message}
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
            placeholder={messages.form.message}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => {}}
        >
          {status === 'sending' ? messages.form.sending : messages.form.submit}
        </Button>
      </form>
    </div>
  )
}