'use client'

import { useState, FormEvent } from 'react'
import { Client } from '@/entities/Client'
import { ClientNote } from '@/entities/ClientNote'
import { motion } from 'framer-motion'

interface ClientNotesViewProps {
  client: Client
  notes: ClientNote[]
  userId: string
}

export function ClientNotesView({ client, notes: initialNotes, userId }: ClientNotesViewProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [loading, setLoading] = useState(false)
  const [showAIInsights, setShowAIInsights] = useState(false)
  const [aiInsights, setAiInsights] = useState<{
    summary?: string
    suggestions?: string[]
    risks?: string[]
  }>({})

  const [formData, setFormData] = useState({
    content: '',
    category: 'general',
    isImportant: false,
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/clients/${client.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newNote = await response.json()
        setNotes([newNote, ...notes])
        setFormData({ content: '', category: 'general', isImportant: false })
      }
    } catch (error) {
      console.error('Error creating note:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAIInsights = async () => {
    setLoading(true)
    setShowAIInsights(true)

    try {
      const response = await fetch(`/api/admin/clients/${client.id}/notes/ai-insights`)
      if (response.ok) {
        const insights = await response.json()
        setAiInsights(insights)
      }
    } catch (error) {
      console.error('Error generating AI insights:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-1">AI Insights</h2>
            <p className="text-sm text-neutral-600">Get AI-powered analysis of client history</p>
          </div>
          <button
            onClick={handleGenerateAIInsights}
            disabled={loading || notes.length === 0}
            className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Insights'}
          </button>
        </div>

        {showAIInsights && Object.keys(aiInsights).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {aiInsights.summary && (
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Summary</h3>
                <p className="text-sm text-neutral-700 bg-white p-3 rounded-lg">
                  {aiInsights.summary}
                </p>
              </div>
            )}

            {aiInsights.suggestions && aiInsights.suggestions.length > 0 && (
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Suggestions</h3>
                <ul className="space-y-2">
                  {aiInsights.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-sm text-neutral-700 bg-white p-3 rounded-lg">
                      • {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiInsights.risks && aiInsights.risks.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-700 mb-2">⚠️ Risks</h3>
                <ul className="space-y-2">
                  {aiInsights.risks.map((risk, idx) => (
                    <li key={idx} className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                      • {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Add Note Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-neutral-200">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Add Note</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="general">General</option>
              <option value="meeting">Meeting</option>
              <option value="payment">Payment</option>
              <option value="project">Project</option>
              <option value="risk">Risk</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Note Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              placeholder="Enter your note here..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isImportant"
              checked={formData.isImportant}
              onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="isImportant" className="text-sm text-neutral-700">
              Mark as important
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Notes History</h2>
        {notes.length === 0 ? (
          <p className="text-neutral-500 text-center py-8">No notes yet</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`bg-white rounded-xl p-6 border ${
                note.isImportant ? 'border-yellow-300 bg-yellow-50' : 'border-neutral-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="px-2 py-1 text-xs font-semibold bg-primary-100 text-primary-700 rounded">
                    {note.category}
                  </span>
                  {note.isImportant && (
                    <span className="ml-2 px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded">
                      Important
                    </span>
                  )}
                </div>
                <span className="text-xs text-neutral-500">
                  {new Date(note.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-neutral-900 mb-2 whitespace-pre-wrap">{note.content}</p>
              {note.createdBy && (
                <p className="text-xs text-neutral-500">By {note.createdBy.name}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}