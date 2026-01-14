import 'reflect-metadata'
import { AppDataSource } from '../lib/db/database'
import { User } from '../entities/User'
import { Client } from '../entities/Client'
import { Project } from '../entities/Project'
import { Payment } from '../entities/Payment'
import { HostingService } from '../entities/HostingService'
import { Reminder } from '../entities/Reminder'
import { Portfolio } from '../entities/Portfolio'
import { Agency } from '../entities/Agency'
import * as bcrypt from 'bcryptjs'

async function seed() {
  try {
    console.log('Initializing database...')
    await AppDataSource.initialize()
    console.log('Database initialized')

    const userRepository = AppDataSource.getRepository(User)
    const clientRepository = AppDataSource.getRepository(Client)
    const projectRepository = AppDataSource.getRepository(Project)
    const paymentRepository = AppDataSource.getRepository(Payment)
    const hostingRepository = AppDataSource.getRepository(HostingService)
    const reminderRepository = AppDataSource.getRepository(Reminder)
    const portfolioRepository = AppDataSource.getRepository(Portfolio)

    const agencyRepository = AppDataSource.getRepository(Agency)

    // Clear existing data (optional - comment out in production)
    console.log('Clearing existing data...')
    await reminderRepository.createQueryBuilder().delete().execute()
    await paymentRepository.createQueryBuilder().delete().execute()
    await hostingRepository.createQueryBuilder().delete().execute()
    await projectRepository.createQueryBuilder().delete().execute()
    await clientRepository.createQueryBuilder().delete().execute()
    await portfolioRepository.createQueryBuilder().delete().execute()
    await userRepository.createQueryBuilder().delete().execute()
    await agencyRepository.createQueryBuilder().delete().execute()

    // 1. Create Super Admin User
    console.log('Creating super admin user...')
    const superAdminPassword = await bcrypt.hash('33333333', 10)
    const superAdmin = userRepository.create({
      email: 'orhanozan33@gmail.com',
      password: superAdminPassword,
      name: 'Super Admin',
      role: 'super_admin',
      isActive: true,
      agencyId: undefined, // Super admin has no agency
    })
    await userRepository.save(superAdmin)
    console.log('✅ Super admin created: orhanozan33@gmail.com / 33333333')

    // 2. Create Agency first
    console.log('Creating agency...')
    let adminAgency = agencyRepository.create({
      name: 'FindPoint Agency',
      domain: 'findpoint.ca',
      defaultCurrency: 'CAD',
      taxRate: 0.13,
      isActive: true,
    })
    await agencyRepository.save(adminAgency)
    console.log('Agency created:', adminAgency.name)

    // 3. Create Regular Admin User (with agency)
    console.log('Creating admin user...')

    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = userRepository.create({
      email: 'admin@findpoint.ca',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
      isActive: true,
      agencyId: adminAgency.id,
    })
    await userRepository.save(admin)
    console.log('Admin user created: admin@findpoint.ca / admin123')

    // 4. Create Example Client (use adminAgency)
    const agency = adminAgency
    console.log('Creating example client...')
    const client = clientRepository.create({
      agencyId: agency.id,
      name: 'John Doe',
      companyName: 'Acme Corporation',
      email: 'john@acme.com',
      phone: '+1-555-0123',
      notes: 'Long-term client, prefers email communication',
      status: 'active',
    })
    await clientRepository.save(client)
    console.log('Client created:', client.name)

    // 5. Create Example Project
    console.log('Creating example project...')
    const project = projectRepository.create({
      agencyId: agency.id,
      name: 'Acme Website Redesign',
      description: 'Complete website redesign with modern UI/UX and performance optimization',
      type: 'redesign',
      clientId: client.id,
      startDate: new Date('2024-01-15'),
      deliveryDate: new Date('2024-03-15'),
      status: 'in-progress',
      price: 15000,
      currency: 'CAD',
    })
    await projectRepository.save(project)
    console.log('Project created:', project.name)

    // 6. Create Example Payment
    console.log('Creating example payment...')
    const payment = paymentRepository.create({
      agencyId: agency.id,
      projectId: project.id,
      amount: 5000,
      currency: 'CAD',
      status: 'paid',
      paymentDate: new Date('2024-01-20'),
      notes: 'Initial deposit',
    })
    await paymentRepository.save(payment)
    console.log('Payment created')

    // 7. Create Example Hosting Service
    console.log('Creating example hosting service...')
    const hosting = hostingRepository.create({
      agencyId: agency.id,
      provider: 'Vercel',
      plan: 'Pro Plan',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2025-01-15'),
      autoRenew: true,
      monthlyCost: 20,
      currency: 'USD',
      projectId: project.id,
      notes: 'Auto-renewal enabled',
    })
    await hostingRepository.save(hosting)
    console.log('Hosting service created')

    // 8. Create Example Reminder
    console.log('Creating example reminder...')
    const reminder = reminderRepository.create({
      agencyId: agency.id,
      type: 'hosting_expiration',
      title: 'Acme Website - Hosting Renewal',
      description: 'Hosting service expires in 30 days',
      dueDate: new Date('2024-12-15'),
      isCompleted: false,
      relatedEntityType: 'hosting',
      relatedEntityId: hosting.id,
      daysBeforeReminder: 30,
    })
    await reminderRepository.save(reminder)
    console.log('Reminder created')

    // 8. Create Example Portfolio Item
    console.log('Creating example portfolio item...')
    const portfolio = portfolioRepository.create({
      title: 'E-Commerce Platform',
      titleFr: 'Plateforme E-Commerce',
      titleTr: 'E-Ticaret Platformu',
      description: 'Modern e-commerce solution with seamless checkout experience.',
      descriptionFr: 'Solution e-commerce moderne avec expérience de paiement fluide.',
      descriptionTr: 'Sorunsuz ödeme deneyimi ile modern e-ticaret çözümü.',
      technologies: ['Next.js', 'TypeScript', 'Stripe', 'PostgreSQL'],
      category: 'E-Commerce',
      isActive: true,
      sortOrder: 1,
    })
    await portfolioRepository.save(portfolio)
    console.log('Portfolio item created')

    console.log('\n✅ Seed completed successfully!')
    console.log('\nLogin credentials:')
    console.log('Super Admin:')
    console.log('  Email: orhanozan33@gmail.com')
    console.log('  Password: 33333333')
    console.log('\nAdmin:')
    console.log('  Email: admin@findpoint.ca')
    console.log('  Password: admin123')
    console.log('\nAccess admin panel at: http://localhost:3000/admin')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  } finally {
    await AppDataSource.destroy()
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })