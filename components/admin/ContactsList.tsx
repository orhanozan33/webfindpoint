'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ConfirmModal } from './ConfirmModal'

interface ContactData {
  id: string
  name: string
  email: string
  message: string
  status: string
  createdAt: Date | string
  updatedAt: Date | string
}

interface ContactsListProps {
  contacts: ContactData[]
}

export function ContactsList({ contacts }: ContactsListProps) {
  const router = useRouter()
  const [selectedContact, setSelectedContact] = useState<ContactData | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null)

  const handleDeleteClick = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmDelete({ id, name })
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return

    const { id } = confirmDelete
    setDeleting(id)
    setError('')

    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setConfirmDelete(null)
        if (selectedContact?.id === id) {
          setSelectedContact(null)
        }
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Mesaj silinemedi')
        setConfirmDelete(null)
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
      console.error('Delete error:', err)
      setConfirmDelete(null)
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (date: Date | string): string => {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
  }

  const formatDateTime = (date: Date | string): string => {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${day}.${month}.${year} ${hours}:${minutes}`
  }

  if (contacts.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
        <p className="text-neutral-500">Henüz iletişim formu gönderisi yok</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700'
      case 'read':
        return 'bg-neutral-100 text-neutral-700'
      case 'replied':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-neutral-100 text-neutral-700'
    }
  }

  return (
    <>
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Mesajı Sil"
        message={`"${confirmDelete?.name}" adlı kişinin mesajını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        variant="danger"
        loading={deleting === confirmDelete?.id}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {contacts.map((contact) => (
        <div
          key={contact.id}
          className={`bg-white rounded-xl border border-neutral-200 p-4 ${
            contact.status === 'new' ? 'border-blue-300 bg-blue-50/30' : ''
          }`}
          onClick={() => setSelectedContact(contact)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-neutral-900 mb-1">{contact.name}</h3>
              <p className="text-sm text-neutral-600">{contact.email}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getStatusColor(contact.status)}`}>
              {contact.status === 'new' ? 'Yeni' :
               contact.status === 'read' ? 'Okundu' :
               contact.status === 'replied' ? 'Yanıtlandı' : contact.status}
            </span>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 w-16">Tarih:</span>
              <span className="text-sm text-neutral-700 flex-1">{formatDate(contact.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-3 border-t border-neutral-200">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedContact(contact)
              }}
              className="flex-1 text-center px-4 py-2 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors touch-manipulation"
            >
              Görüntüle
            </button>
            <button
              onClick={(e) => handleDeleteClick(contact.id, contact.name, e)}
              disabled={deleting === contact.id}
              className="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors touch-manipulation disabled:opacity-50"
            >
              {deleting === contact.id ? 'Siliniyor...' : 'Sil'}
            </button>
          </div>
        </div>
      ))}
    </div>

    {/* Desktop Table View */}
    <div className="hidden md:block bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Ad Soyad</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">E-posta</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Tarih</th>
              <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-neutral-700">Durum</th>
              <th className="px-4 lg:px-6 py-4 text-right text-sm font-semibold text-neutral-700">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {contacts.map((contact) => (
              <tr
                key={contact.id}
                className={`hover:bg-neutral-50 transition-colors cursor-pointer ${
                  contact.status === 'new' ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <td className="px-4 lg:px-6 py-4 font-semibold text-base text-neutral-900">
                  {contact.name}
                </td>
                <td className="px-4 lg:px-6 py-4 text-neutral-600">{contact.email}</td>
                <td className="px-4 lg:px-6 py-4 text-neutral-600">
                  {formatDate(contact.createdAt)}
                </td>
                <td className="px-4 lg:px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                    {contact.status === 'new' ? 'Yeni' :
                     contact.status === 'read' ? 'Okundu' :
                     contact.status === 'replied' ? 'Yanıtlandı' : contact.status}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedContact(contact)
                      }}
                      className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                    >
                      Görüntüle
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(contact.id, contact.name, e)}
                      disabled={deleting === contact.id}
                      className="text-red-600 hover:text-red-700 font-semibold text-sm disabled:opacity-50"
                    >
                      {deleting === contact.id ? 'Siliniyor...' : 'Sil'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
            onClick={() => setSelectedContact(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
                <motion.h2
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-bold text-neutral-900"
                >
                  İletişim Detayları
                </motion.h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedContact(null)}
                  className="text-neutral-500 hover:text-neutral-700 text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                >
                  ✕
                </motion.button>
              </div>
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2 block">
                    Ad Soyad
                  </label>
                  <p className="text-lg text-neutral-900 font-medium">{selectedContact.name}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <label className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2 block">
                    E-posta
                  </label>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="text-lg text-primary-600 hover:text-primary-700 font-medium hover:underline"
                  >
                    {selectedContact.email}
                  </a>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2 block">
                    Mesaj
                  </label>
                  <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                    <p className="text-neutral-900 whitespace-pre-wrap leading-relaxed">
                      {selectedContact.message}
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center justify-between pt-4 border-t border-neutral-200"
                >
                  <div>
                    <label className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2 block">
                      Gönderildi
                    </label>
                    <p className="text-neutral-600">
                      {formatDateTime(selectedContact.createdAt)}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteClick(selectedContact.id, selectedContact.name, e)
                      setSelectedContact(null)
                    }}
                    disabled={deleting === selectedContact.id}
                    className="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleting === selectedContact.id ? 'Siliniyor...' : 'Sil'}
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}