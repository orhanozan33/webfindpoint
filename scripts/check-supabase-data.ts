import 'reflect-metadata'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { initializeDatabase } from '../lib/db/database'
import { Portfolio } from '../entities/Portfolio'
import { Client } from '../entities/Client'
import { Project } from '../entities/Project'
import { Reminder } from '../entities/Reminder'
import { Payment } from '../entities/Payment'
import { HostingService } from '../entities/HostingService'

// Load .env.local file
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function checkSupabaseData() {
  try {
    console.log('Connecting to Supabase...')
    const dataSource = await initializeDatabase()
    console.log('✅ Connected to Supabase\n')

    // Check Portfolio
    const portfolioRepo = dataSource.getRepository(Portfolio)
    const portfolios = await portfolioRepo.find({ order: { createdAt: 'DESC' } })
    console.log(`📁 Portfolio: ${portfolios.length} items`)
    portfolios.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.title} (${new Date(p.createdAt).toLocaleDateString()})`)
    })

    // Check Clients
    const clientRepo = dataSource.getRepository(Client)
    const clients = await clientRepo.find({ order: { createdAt: 'DESC' } })
    console.log(`\n👥 Clients: ${clients.length} items`)
    clients.forEach((c, idx) => {
      console.log(`   ${idx + 1}. ${c.name} - ${c.companyName || 'N/A'} (${new Date(c.createdAt).toLocaleDateString()})`)
    })

    // Check Projects
    const projectRepo = dataSource.getRepository(Project)
    const projects = await projectRepo.find({ order: { createdAt: 'DESC' } })
    console.log(`\n📦 Projects: ${projects.length} items`)
    projects.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.name} - ${p.status} (${new Date(p.createdAt).toLocaleDateString()})`)
    })

    // Check Reminders
    const reminderRepo = dataSource.getRepository(Reminder)
    const reminders = await reminderRepo.find({ order: { createdAt: 'DESC' } })
    console.log(`\n🔔 Reminders: ${reminders.length} items`)
    reminders.forEach((r, idx) => {
      console.log(`   ${idx + 1}. ${r.title} (${r.type}) - Due: ${new Date(r.dueDate).toLocaleDateString()}`)
    })

    // Check Payments
    const paymentRepo = dataSource.getRepository(Payment)
    const payments = await paymentRepo.find({ order: { createdAt: 'DESC' } })
    console.log(`\n💰 Payments: ${payments.length} items`)
    payments.forEach((p, idx) => {
      console.log(`   ${idx + 1}. $${p.amount} ${p.currency} - ${p.status} (${new Date(p.createdAt).toLocaleDateString()})`)
    })

    // Check Hosting Services
    const hostingRepo = dataSource.getRepository(HostingService)
    const hostings = await hostingRepo.find({ order: { createdAt: 'DESC' } })
    console.log(`\n🌐 Hosting Services: ${hostings.length} items`)
    hostings.forEach((h, idx) => {
      console.log(`   ${idx + 1}. ${h.provider} - ${h.plan} (${new Date(h.createdAt).toLocaleDateString()})`)
    })

    console.log(`\n✅ Total records in Supabase:`)
    console.log(`   Portfolio: ${portfolios.length}`)
    console.log(`   Clients: ${clients.length}`)
    console.log(`   Projects: ${projects.length}`)
    console.log(`   Reminders: ${reminders.length}`)
    console.log(`   Payments: ${payments.length}`)
    console.log(`   Hosting Services: ${hostings.length}`)

  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

checkSupabaseData()
  .then(() => {
    console.log('\n✅ Check completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
