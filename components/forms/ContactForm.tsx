'use client'

import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { usePathname } from 'next/navigation'
import { type Locale } from '@/lib/i18n'
import { motion, AnimatePresence } from 'framer-motion'

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
  const pathname = usePathname()
  const locale = (pathname?.split('/')[1] as Locale) || 'en'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('sending')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      // Check if response is successful before parsing JSON
      if (response.ok || response.status === 201) {
        // Try to parse JSON, but don't fail if it's empty
        try {
          const data = await response.json()
          console.log('Contact form success:', data)
        } catch (parseError) {
          // Response is successful but might not have JSON body
          console.log('Contact form success (no JSON body)')
        }
        
        setStatus('success')
        setFormData({ name: '', email: '', message: '' })
        setTimeout(() => setStatus('idle'), 5000)
      } else {
        // Response is not successful, try to get error message
        try {
          const data = await response.json()
          console.error('Contact form error:', data)
        } catch (parseError) {
          console.error('Contact form error (no JSON body):', response.status, response.statusText)
        }
        setStatus('error')
        setTimeout(() => setStatus('idle'), 5000)
      }
    } catch (error) {
      console.error('Contact form network error:', error)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 lg:p-12 border border-neutral-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence mode="wait">
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-sm sm:text-base text-green-800"
          >
            {messages.form.success}
          </motion.div>
        )}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-sm sm:text-base text-red-800"
          >
            {messages.form.error}
          </motion.div>
        )}
      </AnimatePresence>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label htmlFor="name" className="block text-sm font-semibold text-black mb-2">
            {messages.form.name}
          </label>
          <motion.input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 sm:py-3.5 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-neutral-400 text-base touch-manipulation min-h-[44px]"
            placeholder={messages.form.name}
            whileFocus={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">
            {messages.form.email}
          </label>
          <motion.input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 sm:py-3.5 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-neutral-400 text-base touch-manipulation min-h-[44px]"
            placeholder={messages.form.email}
            whileFocus={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label htmlFor="message" className="block text-sm font-semibold text-black mb-2">
            {messages.form.message}
          </label>
          <motion.textarea
            id="message"
            name="message"
            required
            rows={3}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 sm:py-3.5 bg-white text-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none placeholder:text-neutral-400 text-base touch-manipulation min-h-[80px]"
            placeholder={messages.form.message}
            whileFocus={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full min-h-[48px] sm:min-h-[52px] touch-manipulation text-base sm:text-lg"
            >
              {status === 'sending' ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block"
                  >
                    ⏳
                  </motion.span>
                  {messages.form.sending}
                </span>
              ) : (
                messages.form.submit
              )}
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </motion.div>
  )
}