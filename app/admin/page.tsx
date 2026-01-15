import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/database'
import { Client } from '@/entities/Client'
import { Project } from '@/entities/Project'
import { Contact } from '@/entities/Contact'
import { Payment } from '@/entities/Payment'
import { Reminder } from '@/entities/Reminder'
import { DashboardStats } from '@/components/admin/DashboardStats'
import { UpcomingReminders } from '@/components/admin/UpcomingReminders'
import { RecentActivity } from '@/components/admin/RecentActivity'
import { NotificationPreview } from '@/components/admin/NotificationPreview'
import { getAgencyContext, scopeToAgency } from '@/lib/multi-tenant/scope'

// Force dynamic rendering because we use cookies in admin layout
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const session = await getSession()

  if (!session) {
    redirect('/admin/login')
  }

  // Initialize with error handling
  let stats = {
    totalClients: 0,
    activeProjects: 0,
    newContacts: 0,
    totalRevenue: 0,
  }
  let upcomingReminders: any[] = []
  let recentProjects: any[] = []

  try {
    const dataSource = await initializeDatabase()
    const agencyContext = await getAgencyContext(session)

    // Fetch dashboard statistics with error handling
    try {
      // Build queries with agency scope
      const clientRepository = dataSource.getRepository(Client)
      const projectRepository = dataSource.getRepository(Project)
      const contactRepository = dataSource.getRepository(Contact)
      const paymentRepository = dataSource.getRepository(Payment)
      const reminderRepository = dataSource.getRepository(Reminder)

      // Count clients with agency scope
      const clientQuery = scopeToAgency(
        clientRepository.createQueryBuilder('client'),
        agencyContext,
        'client'
      )
      const totalClients = await clientQuery.getCount().catch(() => 0)

      // Count active projects with agency scope
      const activeProjectsQuery = scopeToAgency(
        projectRepository.createQueryBuilder('project').where('project.status = :status', { status: 'in-progress' }),
        agencyContext,
        'project'
      )
      const activeProjects = await activeProjectsQuery.getCount().catch(() => 0)

      // Count new contacts (Contact entity doesn't have agencyId, so no scoping needed)
      const newContacts = await contactRepository.count({ where: { status: 'new' } }).catch(() => 0)

      // Calculate total revenue using SUM query with agency scope
      const revenueQuery = scopeToAgency(
        paymentRepository
          .createQueryBuilder('payment')
          .where('payment.status = :status', { status: 'paid' })
          .select('COALESCE(SUM(payment.amount), 0)', 'total'),
        agencyContext,
        'payment'
      )
      const revenueResult = await revenueQuery.getRawOne().catch(() => ({ total: '0' }))
      const totalRevenue = parseFloat(revenueResult?.total || '0') || 0

      // Get reminders with agency scope
      const remindersQuery = scopeToAgency(
        reminderRepository
          .createQueryBuilder('reminder')
          .where('reminder.isCompleted = :isCompleted', { isCompleted: false })
          .select(['reminder.id', 'reminder.type', 'reminder.title', 'reminder.description', 'reminder.dueDate', 'reminder.isCompleted', 'reminder.createdAt', 'reminder.updatedAt'])
          .orderBy('reminder.dueDate', 'ASC')
          .limit(5),
        agencyContext,
        'reminder'
      )
      const reminders = await remindersQuery.getMany().catch(() => [])

      // Get recent projects with agency scope
      const projectsQuery = scopeToAgency(
        projectRepository
          .createQueryBuilder('project')
          .leftJoinAndSelect('project.client', 'client')
          .select([
            'project.id',
            'project.name',
            'project.description',
            'project.type',
            'project.status',
            'project.price',
            'project.currency',
            'project.clientId',
            'project.createdAt',
            'project.updatedAt',
            'client.id',
            'client.name'
          ])
          .orderBy('project.createdAt', 'DESC')
          .limit(5),
        agencyContext,
        'project'
      )
      const projects = await projectsQuery.getMany().catch(() => [])

      stats = {
        totalClients: totalClients || 0,
        activeProjects: activeProjects || 0,
        newContacts: newContacts || 0,
        totalRevenue: totalRevenue || 0,
      }
      
      // Serialize entities to plain objects
      upcomingReminders = (reminders || []).map((reminder) => ({
        id: reminder.id,
        type: reminder.type,
        title: reminder.title,
        description: reminder.description,
        dueDate: reminder.dueDate,
        isCompleted: reminder.isCompleted,
        createdAt: reminder.createdAt,
        updatedAt: reminder.updatedAt,
      }))
      
      recentProjects = (projects || []).map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        type: project.type,
        status: project.status,
        price: project.price,
        currency: project.currency,
        clientId: project.clientId,
        client: project.client ? {
          id: project.client.id,
          name: project.client.name,
        } : null,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      }))
    } catch (dbError) {
      console.error('Database query error:', dbError)
      // Use default values (already set above)
    }
  } catch (initError) {
    console.error('Database initialization error:', initError)
    // Use default values (already set above)
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 mb-1 sm:mb-2">Kontrol Paneli</h1>
        <p className="text-sm sm:text-base text-neutral-600">Tekrar hoş geldiniz, {session.email}</p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <NotificationPreview session={session} />
        <UpcomingReminders reminders={upcomingReminders} />
        <RecentActivity projects={recentProjects} />
      </div>
    </div>
  )
}