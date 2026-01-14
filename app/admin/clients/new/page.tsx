import { ClientForm } from '@/components/admin/ClientForm'

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Yeni Müşteri</h1>
        <p className="text-neutral-600">Sisteminize yeni bir müşteri ekleyin</p>
      </div>

      <ClientForm />
    </div>
  )
}