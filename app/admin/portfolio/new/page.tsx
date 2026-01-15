import { PortfolioForm } from '@/components/admin/PortfolioForm'

// Force dynamic rendering because we use cookies in admin layout
export const dynamic = 'force-dynamic'

export default function NewPortfolioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Yeni Portföy Öğesi</h1>
        <p className="text-neutral-600">Yeni bir portföy öğesi ekleyin</p>
      </div>

      <PortfolioForm />
    </div>
  )
}
