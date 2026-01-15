import 'reflect-metadata'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { Client } from 'pg'

// Load .env.local file
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function detailedCheck() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '333333',
    database: 'webfindpoint',
  })

  try {
    console.log('Connecting to webfindpoint database...')
    await client.connect()
    console.log('✅ Connected to webfindpoint\n')

    // Check Portfolio - ALL DATA
    console.log('='.repeat(60))
    console.log('📁 PORTFOLIO - ALL RECORDS')
    console.log('='.repeat(60))
    const portfolioResult = await client.query(`SELECT * FROM portfolio ORDER BY "createdAt" DESC`)
    console.log(`Total: ${portfolioResult.rows.length} items\n`)
    portfolioResult.rows.forEach((row: any, idx: number) => {
      console.log(`${idx + 1}. ID: ${row.id}`)
      console.log(`   Title: ${row.title || 'N/A'}`)
      console.log(`   Category: ${row.category || 'N/A'}`)
      console.log(`   Created: ${new Date(row.createdAt).toLocaleString()}`)
      console.log(`   Active: ${row.isActive}`)
      console.log('')
    })

    // Check Clients - ALL DATA
    console.log('='.repeat(60))
    console.log('👥 CLIENTS - ALL RECORDS')
    console.log('='.repeat(60))
    const clientsResult = await client.query(`SELECT * FROM clients ORDER BY "createdAt" DESC`)
    console.log(`Total: ${clientsResult.rows.length} items\n`)
    clientsResult.rows.forEach((row: any, idx: number) => {
      console.log(`${idx + 1}. ID: ${row.id}`)
      console.log(`   Name: ${row.name}`)
      console.log(`   Company: ${row.companyName || 'N/A'}`)
      console.log(`   Email: ${row.email}`)
      console.log(`   Phone: ${row.phone || 'N/A'}`)
      console.log(`   Status: ${row.status}`)
      console.log(`   Created: ${new Date(row.createdAt).toLocaleString()}`)
      console.log('')
    })

    // Check Projects - ALL DATA
    console.log('='.repeat(60))
    console.log('📦 PROJECTS - ALL RECORDS')
    console.log('='.repeat(60))
    const projectsResult = await client.query(`SELECT * FROM projects ORDER BY "createdAt" DESC`)
    console.log(`Total: ${projectsResult.rows.length} items\n`)
    projectsResult.rows.forEach((row: any, idx: number) => {
      console.log(`${idx + 1}. ID: ${row.id}`)
      console.log(`   Name: ${row.name}`)
      console.log(`   Type: ${row.type}`)
      console.log(`   Status: ${row.status}`)
      console.log(`   Price: ${row.price || 'N/A'} ${row.currency || ''}`)
      console.log(`   Created: ${new Date(row.createdAt).toLocaleString()}`)
      console.log('')
    })

    // Check Reminders - ALL DATA
    console.log('='.repeat(60))
    console.log('🔔 REMINDERS - ALL RECORDS')
    console.log('='.repeat(60))
    const remindersResult = await client.query(`SELECT * FROM reminders ORDER BY "createdAt" DESC`)
    console.log(`Total: ${remindersResult.rows.length} items\n`)
    remindersResult.rows.forEach((row: any, idx: number) => {
      console.log(`${idx + 1}. ID: ${row.id}`)
      console.log(`   Title: ${row.title}`)
      console.log(`   Type: ${row.type}`)
      console.log(`   Due Date: ${new Date(row.dueDate).toLocaleDateString()}`)
      console.log(`   Completed: ${row.isCompleted}`)
      console.log(`   Created: ${new Date(row.createdAt).toLocaleString()}`)
      console.log('')
    })

    // Check Payments - ALL DATA
    console.log('='.repeat(60))
    console.log('💰 PAYMENTS - ALL RECORDS')
    console.log('='.repeat(60))
    const paymentsResult = await client.query(`SELECT * FROM payments ORDER BY "createdAt" DESC`)
    console.log(`Total: ${paymentsResult.rows.length} items\n`)
    paymentsResult.rows.forEach((row: any, idx: number) => {
      console.log(`${idx + 1}. ID: ${row.id}`)
      console.log(`   Amount: ${row.amount} ${row.currency}`)
      console.log(`   Status: ${row.status}`)
      console.log(`   Date: ${row.paymentDate ? new Date(row.paymentDate).toLocaleDateString() : 'N/A'}`)
      console.log(`   Notes: ${row.notes || 'N/A'}`)
      console.log(`   Created: ${new Date(row.createdAt).toLocaleString()}`)
      console.log('')
    })

    // Check Hosting Services - ALL DATA
    console.log('='.repeat(60))
    console.log('🌐 HOSTING SERVICES - ALL RECORDS')
    console.log('='.repeat(60))
    const hostingResult = await client.query(`SELECT * FROM hosting_services ORDER BY "createdAt" DESC`)
    console.log(`Total: ${hostingResult.rows.length} items\n`)
    hostingResult.rows.forEach((row: any, idx: number) => {
      console.log(`${idx + 1}. ID: ${row.id}`)
      console.log(`   Provider: ${row.provider}`)
      console.log(`   Plan: ${row.plan}`)
      console.log(`   Cost: ${row.monthlyCost} ${row.currency}/month`)
      console.log(`   Start: ${new Date(row.startDate).toLocaleDateString()}`)
      console.log(`   End: ${new Date(row.endDate).toLocaleDateString()}`)
      console.log(`   Created: ${new Date(row.createdAt).toLocaleString()}`)
      console.log('')
    })

    // Summary
    console.log('='.repeat(60))
    console.log('📊 SUMMARY')
    console.log('='.repeat(60))
    console.log(`Portfolio: ${portfolioResult.rows.length} items`)
    console.log(`Clients: ${clientsResult.rows.length} items`)
    console.log(`Projects: ${projectsResult.rows.length} items`)
    console.log(`Reminders: ${remindersResult.rows.length} items`)
    console.log(`Payments: ${paymentsResult.rows.length} items`)
    console.log(`Hosting Services: ${hostingResult.rows.length} items`)

    await client.end()
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

detailedCheck()
  .then(() => {
    console.log('\n✅ Detailed check completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
