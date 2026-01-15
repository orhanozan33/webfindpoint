import 'reflect-metadata'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local file
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

import { initializeDatabase } from '../lib/db/database'
import { User } from '../entities/User'
import { Client } from '../entities/Client'
import { Project } from '../entities/Project'
import { Payment } from '../entities/Payment'
import { HostingService } from '../entities/HostingService'
import { Reminder } from '../entities/Reminder'
import { Portfolio } from '../entities/Portfolio'
import { Agency } from '../entities/Agency'
import { Invoice } from '../entities/Invoice'
import { InvoiceItem } from '../entities/InvoiceItem'
import { ClientNote } from '../entities/ClientNote'
import { Notification } from '../entities/Notification'
import * as bcrypt from 'bcryptjs'

async function seed() {
  try {
    console.log('Initializing database...')
    const dataSource = await initializeDatabase()
    console.log('Database initialized')

    const userRepository = dataSource.getRepository(User)
    const clientRepository = dataSource.getRepository(Client)
    const projectRepository = dataSource.getRepository(Project)
    const paymentRepository = dataSource.getRepository(Payment)
    const hostingRepository = dataSource.getRepository(HostingService)
    const reminderRepository = dataSource.getRepository(Reminder)
    const portfolioRepository = dataSource.getRepository(Portfolio)
    const invoiceRepository = dataSource.getRepository(Invoice)
    const invoiceItemRepository = dataSource.getRepository(InvoiceItem)
    const clientNoteRepository = dataSource.getRepository(ClientNote)
    const notificationRepository = dataSource.getRepository(Notification)

    const agencyRepository = dataSource.getRepository(Agency)

    // Clear existing data (optional - comment out in production)
    console.log('Clearing existing data...')
    await invoiceItemRepository.createQueryBuilder().delete().execute()
    await invoiceRepository.createQueryBuilder().delete().execute()
    await clientNoteRepository.createQueryBuilder().delete().execute()
    await notificationRepository.createQueryBuilder().delete().execute()
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

    // 4. Create Example Clients (use adminAgency)
    const agency = adminAgency
    console.log('Creating example clients...')
    
    // Client 1: Epic
    const client1 = clientRepository.create({
      agencyId: agency.id,
      name: 'Epic Client',
      companyName: 'Epic Corporation',
      email: 'contact@epic.com',
      phone: '+1-555-0101',
      notes: 'Epic client - high priority',
      status: 'active',
    })
    await clientRepository.save(client1)
    console.log('Client created:', client1.name)

    // Client 2: Buhara
    const client2 = clientRepository.create({
      agencyId: agency.id,
      name: 'Buhara Client',
      companyName: 'Buhara Ltd',
      email: 'info@buhara.com',
      phone: '+1-555-0102',
      notes: 'Buhara client',
      status: 'active',
    })
    await clientRepository.save(client2)
    console.log('Client created:', client2.name)

    // Client 3: Kay
    const client3 = clientRepository.create({
      agencyId: agency.id,
      name: 'Kay Client',
      companyName: 'Kay Industries',
      email: 'hello@kay.com',
      phone: '+1-555-0103',
      notes: 'Kay client',
      status: 'active',
    })
    await clientRepository.save(client3)
    console.log('Client created:', client3.name)

    // Client 4: Oto
    const client4 = clientRepository.create({
      agencyId: agency.id,
      name: 'Oto Client',
      companyName: 'Oto Motors',
      email: 'info@oto.com',
      phone: '+1-555-0104',
      notes: 'Oto automotive client',
      status: 'active',
    })
    await clientRepository.save(client4)
    console.log('Client created:', client4.name)

    // Client 5: Acme (original)
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

    // 5. Create Example Projects
    console.log('Creating example projects...')
    
    // Project 1: Epic
    const project1 = projectRepository.create({
      agencyId: agency.id,
      name: 'Epic Website',
      description: 'Epic corporation website development',
      type: 'development',
      clientId: client1.id,
      startDate: new Date('2024-02-01'),
      deliveryDate: new Date('2024-04-01'),
      status: 'in-progress',
      price: 20000,
      currency: 'CAD',
    })
    await projectRepository.save(project1)
    console.log('Project created:', project1.name)

    // Project 2: Buhara
    const project2 = projectRepository.create({
      agencyId: agency.id,
      name: 'Buhara E-Commerce',
      description: 'Buhara e-commerce platform',
      type: 'development',
      clientId: client2.id,
      startDate: new Date('2024-01-10'),
      deliveryDate: new Date('2024-03-10'),
      status: 'in-progress',
      price: 25000,
      currency: 'CAD',
    })
    await projectRepository.save(project2)
    console.log('Project created:', project2.name)

    // Project 3: Kay
    const project3 = projectRepository.create({
      agencyId: agency.id,
      name: 'Kay Branding',
      description: 'Kay Industries branding and design',
      type: 'design',
      clientId: client3.id,
      startDate: new Date('2024-01-20'),
      deliveryDate: new Date('2024-02-20'),
      status: 'completed',
      price: 8000,
      currency: 'CAD',
    })
    await projectRepository.save(project3)
    console.log('Project created:', project3.name)

    // Project 4: Oto
    const project4 = projectRepository.create({
      agencyId: agency.id,
      name: 'Oto Motors Website',
      description: 'Oto Motors automotive website',
      type: 'development',
      clientId: client4.id,
      startDate: new Date('2024-02-15'),
      deliveryDate: new Date('2024-05-15'),
      status: 'in-progress',
      price: 30000,
      currency: 'CAD',
    })
    await projectRepository.save(project4)
    console.log('Project created:', project4.name)

    // Project 5: Acme (original)
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

    // 6. Create Example Payments
    console.log('Creating example payments...')
    
    // Payment 1: Epic
    const payment1 = paymentRepository.create({
      agencyId: agency.id,
      projectId: project1.id,
      amount: 10000,
      currency: 'CAD',
      status: 'paid',
      paymentDate: new Date('2024-02-05'),
      notes: 'Epic project initial deposit',
    })
    await paymentRepository.save(payment1)
    console.log('Payment created for Epic')

    // Payment 2: Buhara
    const payment2 = paymentRepository.create({
      agencyId: agency.id,
      projectId: project2.id,
      amount: 12500,
      currency: 'CAD',
      status: 'paid',
      paymentDate: new Date('2024-01-15'),
      notes: 'Buhara project deposit',
    })
    await paymentRepository.save(payment2)
    console.log('Payment created for Buhara')

    // Payment 3: Kay
    const payment3 = paymentRepository.create({
      agencyId: agency.id,
      projectId: project3.id,
      amount: 8000,
      currency: 'CAD',
      status: 'paid',
      paymentDate: new Date('2024-01-25'),
      notes: 'Kay project full payment',
    })
    await paymentRepository.save(payment3)
    console.log('Payment created for Kay')

    // Payment 4: Oto
    const payment4 = paymentRepository.create({
      agencyId: agency.id,
      projectId: project4.id,
      amount: 15000,
      currency: 'CAD',
      status: 'paid',
      paymentDate: new Date('2024-02-20'),
      notes: 'Oto project initial deposit',
    })
    await paymentRepository.save(payment4)
    console.log('Payment created for Oto')

    // Payment 5: Acme (original)
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
    console.log('Payment created for Acme')

    // Additional Payments
    // Epic - Second payment
    const payment1b = paymentRepository.create({
      agencyId: agency.id,
      projectId: project1.id,
      amount: 5000,
      currency: 'CAD',
      status: 'pending',
      paymentDate: new Date('2024-03-01'),
      notes: 'Epic project milestone payment',
    })
    await paymentRepository.save(payment1b)
    console.log('Second payment created for Epic')

    // Buhara - Second payment
    const payment2b = paymentRepository.create({
      agencyId: agency.id,
      projectId: project2.id,
      amount: 12500,
      currency: 'CAD',
      status: 'pending',
      paymentDate: new Date('2024-02-15'),
      notes: 'Buhara project final payment',
    })
    await paymentRepository.save(payment2b)
    console.log('Second payment created for Buhara')

    // Oto - Second payment
    const payment4b = paymentRepository.create({
      agencyId: agency.id,
      projectId: project4.id,
      amount: 10000,
      currency: 'CAD',
      status: 'pending',
      paymentDate: new Date('2024-04-01'),
      notes: 'Oto project milestone payment',
    })
    await paymentRepository.save(payment4b)
    console.log('Second payment created for Oto')

    // Acme - Second payment
    const payment5b = paymentRepository.create({
      agencyId: agency.id,
      projectId: project.id,
      amount: 5000,
      currency: 'CAD',
      status: 'pending',
      paymentDate: new Date('2024-02-15'),
      notes: 'Acme project milestone payment',
    })
    await paymentRepository.save(payment5b)
    console.log('Second payment created for Acme')

    // 7. Create Example Hosting Services
    console.log('Creating example hosting services...')
    
    // Hosting 1: Epic
    const hosting1 = hostingRepository.create({
      agencyId: agency.id,
      provider: 'Vercel',
      plan: 'Pro Plan',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2025-02-01'),
      autoRenew: true,
      monthlyCost: 20,
      currency: 'USD',
      projectId: project1.id,
      notes: 'Epic project hosting',
    })
    await hostingRepository.save(hosting1)
    console.log('Hosting service created for Epic')

    // Hosting 2: Buhara
    const hosting2 = hostingRepository.create({
      agencyId: agency.id,
      provider: 'AWS',
      plan: 'Business Plan',
      startDate: new Date('2024-01-10'),
      endDate: new Date('2025-01-10'),
      autoRenew: true,
      monthlyCost: 50,
      currency: 'USD',
      projectId: project2.id,
      notes: 'Buhara project hosting',
    })
    await hostingRepository.save(hosting2)
    console.log('Hosting service created for Buhara')

    // Hosting 3: Oto
    const hosting3 = hostingRepository.create({
      agencyId: agency.id,
      provider: 'Netlify',
      plan: 'Pro Plan',
      startDate: new Date('2024-02-15'),
      endDate: new Date('2025-02-15'),
      autoRenew: true,
      monthlyCost: 19,
      currency: 'USD',
      projectId: project4.id,
      notes: 'Oto project hosting',
    })
    await hostingRepository.save(hosting3)
    console.log('Hosting service created for Oto')

    // Hosting 4: Acme (original)
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
    console.log('Hosting service created for Acme')

    // 8. Create Example Reminders
    console.log('Creating example reminders...')
    
    // Reminder 1: Epic
    const reminder1 = reminderRepository.create({
      agencyId: agency.id,
      type: 'hosting_expiration',
      title: 'Epic Website - Hosting Renewal',
      description: 'Epic hosting service expires in 30 days',
      dueDate: new Date('2025-01-01'),
      isCompleted: false,
      relatedEntityType: 'hosting',
      relatedEntityId: hosting1.id,
      daysBeforeReminder: 30,
    })
    await reminderRepository.save(reminder1)
    console.log('Reminder created for Epic')

    // Reminder 2: Buhara
    const reminder2 = reminderRepository.create({
      agencyId: agency.id,
      type: 'hosting_expiration',
      title: 'Buhara E-Commerce - Hosting Renewal',
      description: 'Buhara hosting service expires in 30 days',
      dueDate: new Date('2024-12-10'),
      isCompleted: false,
      relatedEntityType: 'hosting',
      relatedEntityId: hosting2.id,
      daysBeforeReminder: 30,
    })
    await reminderRepository.save(reminder2)
    console.log('Reminder created for Buhara')

    // Reminder 3: Oto
    const reminder3 = reminderRepository.create({
      agencyId: agency.id,
      type: 'hosting_expiration',
      title: 'Oto Motors - Hosting Renewal',
      description: 'Oto hosting service expires in 30 days',
      dueDate: new Date('2025-01-15'),
      isCompleted: false,
      relatedEntityType: 'hosting',
      relatedEntityId: hosting3.id,
      daysBeforeReminder: 30,
    })
    await reminderRepository.save(reminder3)
    console.log('Reminder created for Oto')

    // Reminder 4: Acme (original)
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
    console.log('Reminder created for Acme')

    // Additional Reminders - Payment Due
    // Reminder 5: Epic Payment Due
    const reminder5 = reminderRepository.create({
      agencyId: agency.id,
      type: 'payment_due',
      title: 'Epic Website - Payment Due',
      description: 'Epic project milestone payment due on March 1, 2024',
      dueDate: new Date('2024-03-01'),
      isCompleted: false,
      relatedEntityType: 'project',
      relatedEntityId: project1.id,
      daysBeforeReminder: 7,
    })
    await reminderRepository.save(reminder5)
    console.log('Payment reminder created for Epic')

    // Reminder 6: Buhara Payment Due
    const reminder6 = reminderRepository.create({
      agencyId: agency.id,
      type: 'payment_due',
      title: 'Buhara E-Commerce - Payment Due',
      description: 'Buhara project final payment due on February 15, 2024',
      dueDate: new Date('2024-02-15'),
      isCompleted: false,
      relatedEntityType: 'project',
      relatedEntityId: project2.id,
      daysBeforeReminder: 7,
    })
    await reminderRepository.save(reminder6)
    console.log('Payment reminder created for Buhara')

    // Reminder 7: Oto Payment Due
    const reminder7 = reminderRepository.create({
      agencyId: agency.id,
      type: 'payment_due',
      title: 'Oto Motors - Payment Due',
      description: 'Oto project milestone payment due on April 1, 2024',
      dueDate: new Date('2024-04-01'),
      isCompleted: false,
      relatedEntityType: 'project',
      relatedEntityId: project4.id,
      daysBeforeReminder: 7,
    })
    await reminderRepository.save(reminder7)
    console.log('Payment reminder created for Oto')

    // Reminder 8: Acme Payment Due
    const reminder8 = reminderRepository.create({
      agencyId: agency.id,
      type: 'payment_due',
      title: 'Acme Website - Payment Due',
      description: 'Acme project milestone payment due on February 15, 2024',
      dueDate: new Date('2024-02-15'),
      isCompleted: false,
      relatedEntityType: 'project',
      relatedEntityId: project.id,
      daysBeforeReminder: 7,
    })
    await reminderRepository.save(reminder8)
    console.log('Payment reminder created for Acme')

    // 9. Create Invoices
    console.log('Creating example invoices...')
    
    // Invoice 1: Epic
    const invoice1 = invoiceRepository.create({
      agencyId: agency.id,
      invoiceNumber: 'INV-2024-001',
      clientId: client1.id,
      projectId: project1.id,
      issueDate: new Date('2024-02-01'),
      dueDate: new Date('2024-02-15'),
      subtotal: 20000,
      tax: 2600,
      total: 22600,
      currency: 'CAD',
      status: 'sent',
      notes: 'Epic Website Development - Invoice #1',
    })
    await invoiceRepository.save(invoice1)
    
    // Invoice Items for Epic
    const invoiceItem1a = invoiceItemRepository.create({
      invoiceId: invoice1.id,
      description: 'Website Development - Phase 1',
      quantity: 1,
      unitPrice: 15000,
      total: 15000,
    })
    await invoiceItemRepository.save(invoiceItem1a)
    
    const invoiceItem1b = invoiceItemRepository.create({
      invoiceId: invoice1.id,
      description: 'UI/UX Design',
      quantity: 1,
      unitPrice: 5000,
      total: 5000,
    })
    await invoiceItemRepository.save(invoiceItem1b)
    console.log('Invoice created for Epic')

    // Invoice 2: Buhara
    const invoice2 = invoiceRepository.create({
      agencyId: agency.id,
      invoiceNumber: 'INV-2024-002',
      clientId: client2.id,
      projectId: project2.id,
      issueDate: new Date('2024-01-10'),
      dueDate: new Date('2024-01-25'),
      subtotal: 25000,
      tax: 3250,
      total: 28250,
      currency: 'CAD',
      status: 'paid',
      notes: 'Buhara E-Commerce Platform - Invoice #1',
    })
    await invoiceRepository.save(invoice2)
    
    // Invoice Items for Buhara
    const invoiceItem2a = invoiceItemRepository.create({
      invoiceId: invoice2.id,
      description: 'E-Commerce Platform Development',
      quantity: 1,
      unitPrice: 20000,
      total: 20000,
    })
    await invoiceItemRepository.save(invoiceItem2a)
    
    const invoiceItem2b = invoiceItemRepository.create({
      invoiceId: invoice2.id,
      description: 'Payment Integration',
      quantity: 1,
      unitPrice: 5000,
      total: 5000,
    })
    await invoiceItemRepository.save(invoiceItem2b)
    console.log('Invoice created for Buhara')

    // Invoice 3: Oto
    const invoice3 = invoiceRepository.create({
      agencyId: agency.id,
      invoiceNumber: 'INV-2024-003',
      clientId: client4.id,
      projectId: project4.id,
      issueDate: new Date('2024-02-15'),
      dueDate: new Date('2024-03-01'),
      subtotal: 30000,
      tax: 3900,
      total: 33900,
      currency: 'CAD',
      status: 'sent',
      notes: 'Oto Motors Website - Invoice #1',
    })
    await invoiceRepository.save(invoice3)
    
    // Invoice Items for Oto
    const invoiceItem3a = invoiceItemRepository.create({
      invoiceId: invoice3.id,
      description: 'Automotive Website Development',
      quantity: 1,
      unitPrice: 25000,
      total: 25000,
    })
    await invoiceItemRepository.save(invoiceItem3a)
    
    const invoiceItem3b = invoiceItemRepository.create({
      invoiceId: invoice3.id,
      description: 'Vehicle Inventory System',
      quantity: 1,
      unitPrice: 5000,
      total: 5000,
    })
    await invoiceItemRepository.save(invoiceItem3b)
    console.log('Invoice created for Oto')

    // 10. Create Client Notes
    console.log('Creating example client notes...')
    
    // Note 1: Epic
    const note1 = clientNoteRepository.create({
      agencyId: agency.id,
      clientId: client1.id,
      createdById: admin.id,
      content: 'Epic client requested additional features for their website. Meeting scheduled for next week.',
      category: 'meeting',
      isImportant: true,
    })
    await clientNoteRepository.save(note1)
    console.log('Client note created for Epic')

    // Note 2: Buhara
    const note2 = clientNoteRepository.create({
      agencyId: agency.id,
      clientId: client2.id,
      createdById: admin.id,
      content: 'Buhara e-commerce platform is progressing well. Payment received on time.',
      category: 'payment',
      isImportant: false,
    })
    await clientNoteRepository.save(note2)
    console.log('Client note created for Buhara')

    // Note 3: Kay
    const note3 = clientNoteRepository.create({
      agencyId: agency.id,
      clientId: client3.id,
      createdById: admin.id,
      content: 'Kay branding project completed successfully. Client very satisfied with the results.',
      category: 'project',
      isImportant: false,
    })
    await clientNoteRepository.save(note3)
    console.log('Client note created for Kay')

    // Note 4: Oto
    const note4 = clientNoteRepository.create({
      agencyId: agency.id,
      clientId: client4.id,
      createdById: admin.id,
      content: 'Oto Motors website development in progress. Need to discuss vehicle inventory requirements.',
      category: 'project',
      isImportant: true,
    })
    await clientNoteRepository.save(note4)
    console.log('Client note created for Oto')

    // 11. Create Notifications
    console.log('Creating example notifications...')
    
    // Notification 1: Payment Due
    const notification1 = notificationRepository.create({
      agencyId: agency.id,
      userId: admin.id,
      type: 'payment_due',
      title: 'Payment Due: Epic Website',
      message: 'Epic project milestone payment is due on March 1, 2024',
      link: `/admin/projects/${project1.id}`,
      isRead: false,
      severity: 'warning',
      relatedEntityType: 'project',
      relatedEntityId: project1.id,
    })
    await notificationRepository.save(notification1)
    console.log('Notification created: Payment Due Epic')

    // Notification 2: Hosting Expiration
    const notification2 = notificationRepository.create({
      agencyId: agency.id,
      userId: admin.id,
      type: 'hosting_expiration',
      title: 'Hosting Expiration: Buhara E-Commerce',
      message: 'Buhara hosting service expires in 30 days',
      link: `/admin/hosting/${hosting2.id}`,
      isRead: false,
      severity: 'warning',
      relatedEntityType: 'hosting',
      relatedEntityId: hosting2.id,
    })
    await notificationRepository.save(notification2)
    console.log('Notification created: Hosting Expiration Buhara')

    // Notification 3: Invoice Overdue
    const notification3 = notificationRepository.create({
      agencyId: agency.id,
      userId: admin.id,
      type: 'invoice_overdue',
      title: 'Invoice Overdue: Oto Motors',
      message: 'Invoice INV-2024-003 is overdue',
      link: `/admin/invoices/${invoice3.id}`,
      isRead: false,
      severity: 'error',
      relatedEntityType: 'invoice',
      relatedEntityId: invoice3.id,
    })
    await notificationRepository.save(notification3)
    console.log('Notification created: Invoice Overdue Oto')

    // Notification 4: Project Deadline
    const notification4 = notificationRepository.create({
      agencyId: agency.id,
      userId: admin.id,
      type: 'project_deadline',
      title: 'Project Deadline: Acme Website',
      message: 'Acme Website Redesign deadline is approaching',
      link: `/admin/projects/${project.id}`,
      isRead: false,
      severity: 'info',
      relatedEntityType: 'project',
      relatedEntityId: project.id,
    })
    await notificationRepository.save(notification4)
    console.log('Notification created: Project Deadline Acme')

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
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })