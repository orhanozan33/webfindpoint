'use client'

import { useState } from 'react'

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
  const [selectedContact, setSelectedContact] = useState<ContactData | null>(null)

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
          <div className="pt-3 border-t border-neutral-200">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedContact(contact)
              }}
              className="block w-full text-center px-4 py-2 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors touch-manipulation"
            >
              Görüntüle
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedContact(contact)
                    }}
                    className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                  >
                    Görüntüle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">İletişim Detayları</h2>
              <button
                onClick={() => setSelectedContact(null)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-neutral-700">Ad Soyad</label>
                <p className="text-neutral-900">{selectedContact.name}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-neutral-700">E-posta</label>
                <p className="text-neutral-900">{selectedContact.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-neutral-700">Mesaj</label>
                <p className="text-neutral-900 whitespace-pre-wrap">{selectedContact.message}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-neutral-700">Gönderildi</label>
                <p className="text-neutral-900">
                  {formatDateTime(selectedContact.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}