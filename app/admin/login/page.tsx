'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { fadeIn, slideUp } from '@/lib/motion/variants'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Clear any invalid cookies on mount
  useEffect(() => {
    // Clear admin-token cookie if it exists (might be invalid)
    document.cookie = 'admin-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const requestBody = { email, password }
      console.log('Sending login request:', { email, method: 'POST', url: '/api/auth/login' })
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        // Response is not JSON (probably an error page)
        const text = await response.text()
        console.error('Non-JSON response:', text.substring(0, 200))
        setError('Sunucu hatası. Lütfen konsolu kontrol edin.')
        setLoading(false)
        return
      }

      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        console.log('Login successful, redirecting...')
        // Wait a bit for cookie to be set, then redirect
        setTimeout(() => {
          window.location.href = '/admin'
        }, 100)
      } else {
        // Show specific error message from server
        const errorMessage = data.error || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.'
        console.error('Login failed:', errorMessage)
        setError(errorMessage)
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-white">
      <motion.div
        className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-neutral-200"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <motion.div variants={slideUp} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">FindPoint Admin</h1>
          <p className="text-neutral-600">Panele erişmek için giriş yapın</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
              E-posta
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              placeholder="admin@findpoint.ca"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 mb-2">
              Şifre
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}