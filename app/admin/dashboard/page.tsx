import { initializeDatabase } from '@/lib/db/database'
import { Client } from '@/entities/Client'
import { Project } from '@/entities/Project'
import { Payment } from '@/entities/Payment'
import { Invoice } from '@/entities/Invoice'
import { Reminder } from '@/entities/Reminder'
import { DashboardOverview } from '@/components/admin/DashboardOverview'
import { RevenueChart } from '@/components/admin/RevenueChart'
import { ProjectsChart } from '@/components/admin/ProjectsChart'
import { UpcomingRenewals } from '@/components/admin/UpcomingRenewals'
import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

// Force dynamic rendering because we use cookies in admin layout
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) {
    redirect('/admin/login')
  }

  const dataSource = await initializeDatabase()

  // Fetch dashboard data
  const [
    totalClients,
    activeProjects,
    totalRevenue,
    outstandingPayments,
    monthlyRevenue,
    projectStatuses,
    upcomingRenewals,
  ] = await Promise.all([
    dataSource.getRepository(Client).count({ where: { status: 'active' } }),
    dataSource.getRepository(Project).count({ where: { status: 'in-progress' } }),
    dataSource.getRepository(Payment).sum('amount', { status: 'paid' }),
    dataSource.getRepository(Payment).sum('amount', { status: 'unpaid' }),
    getMonthlyRevenue(dataSource),
    getProjectStatuses(dataSource),
    getUpcomingRenewals(dataSource),
  ])

  const stats = {
    totalClients,
    activeProjects,
    totalRevenue: totalRevenue || 0,
    outstandingPayments: outstandingPayments || 0,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Dashboard</h1>
        <p className="text-neutral-600">Executive overview and analytics</p>
      </div>

      <DashboardOverview stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={monthlyRevenue} />
        <ProjectsChart data={projectStatuses} />
      </div>

      <UpcomingRenewals renewals={upcomingRenewals} />
    </div>
  )
}

async function getMonthlyRevenue(dataSource: any) {
  const paymentRepository = dataSource.getRepository(Payment)
  const payments = await paymentRepository.find({
    where: { status: 'paid' },
    order: { paymentDate: 'DESC' },
    take: 12,
  })

  // Group by month
  const monthly: Record<string, number> = {}
  payments.forEach((payment: Payment) => {
    if (payment.paymentDate) {
      const month = new Date(payment.paymentDate).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'short',
      })
      monthly[month] = (monthly[month] || 0) + Number(payment.amount)
    }
  })

  return Object.entries(monthly)
    .map(([month, revenue]) => ({ month, revenue: Number(revenue) }))
    .reverse()
}

async function getProjectStatuses(dataSource: any) {
  const projectRepository = dataSource.getRepository(Project)
  const projects = await projectRepository.find()

  const statuses: Record<string, number> = {}
  projects.forEach((project: Project) => {
    statuses[project.status] = (statuses[project.status] || 0) + 1
  })

  return Object.entries(statuses).map(([status, count]) => ({
    status,
    count: Number(count),
  }))
}

async function getUpcomingRenewals(dataSource: any) {
  const reminderRepository = dataSource.getRepository(Reminder)
  const reminders = await reminderRepository.find({
    where: {
      isCompleted: false,
      type: 'hosting_expiration',
    },
    order: { dueDate: 'ASC' },
    take: 5,
  })

  return reminders
}