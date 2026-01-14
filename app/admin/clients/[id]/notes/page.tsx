import { initializeDatabase } from '@/lib/db/database'
import { Client } from '@/entities/Client'
import { ClientNote } from '@/entities/ClientNote'
import { notFound } from 'next/navigation'
import { ClientNotesView } from '@/components/admin/ClientNotesView'
import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export default async function ClientNotesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) {
    redirect('/admin/login')
  }

  const { id } = await params
  const dataSource = await initializeDatabase()

  const clientRepository = dataSource.getRepository(Client)
  const client = await clientRepository.findOne({ where: { id } })

  if (!client) {
    notFound()
  }

  const notesRepository = dataSource.getRepository(ClientNote)
  const notes = await notesRepository.find({
    where: { clientId: id },
    relations: ['createdBy'],
    order: { createdAt: 'DESC' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Client Notes</h1>
        <p className="text-neutral-600">Notes and AI insights for {client.name}</p>
      </div>

      <ClientNotesView client={client} notes={notes} userId={session.userId} />
    </div>
  )
}