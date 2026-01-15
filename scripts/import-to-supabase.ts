import 'reflect-metadata'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { initializeDatabase } from '../lib/db/database'
import { Agency } from '../entities/Agency'
import { User } from '../entities/User'
import { Client } from '../entities/Client'
import { Project } from '../entities/Project'
import { Payment } from '../entities/Payment'
import { HostingService } from '../entities/HostingService'
import { Invoice } from '../entities/Invoice'
import { InvoiceItem } from '../entities/InvoiceItem'
import { Reminder } from '../entities/Reminder'
import { ClientNote } from '../entities/ClientNote'
import { Notification } from '../entities/Notification'
import { Portfolio } from '../entities/Portfolio'
import { Contact } from '../entities/Contact'

// Load .env.local file
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function importToSupabase() {
  // Read export file
  const exportFile = path.resolve(__dirname, '../local-db-export.json')
  
  if (!fs.existsSync(exportFile)) {
    console.error(`❌ Export file not found: ${exportFile}`)
    console.error('Please run: npm run export-local-db first')
    process.exit(1)
  }

  const exportData = JSON.parse(fs.readFileSync(exportFile, 'utf-8'))
  console.log(`📦 Importing data exported at: ${exportData.exportedAt}`)

  try {
    console.log('Connecting to Supabase...')
    const dataSource = await initializeDatabase()
    console.log('✅ Connected to Supabase')

    // Import order matters due to foreign keys
    // Map table names to entities
    const tableEntityMap: { [key: string]: any } = {
      'agencies': Agency,
      'users': User,
      'clients': Client,
      'projects': Project,
      'payments': Payment,
      'hosting_services': HostingService,
      'invoices': Invoice,
      'invoice_items': InvoiceItem,
      'reminders': Reminder,
      'client_notes': ClientNote,
      'notifications': Notification,
      'portfolio': Portfolio,
      'contacts': Contact,
      'contact_submissions': Contact, // Also handle contact_submissions table name
    }

    const importOrder = Object.keys(tableEntityMap)

    // Clear existing data first (optional - comment out if you want to keep existing data)
    console.log('\n⚠️  Clearing existing data in Supabase...')
    for (const table of [...importOrder].reverse()) {
      try {
        const Entity = tableEntityMap[table]
        if (!Entity) continue
        const repository = dataSource.getRepository(Entity)
        await repository.createQueryBuilder().delete().execute()
        console.log(`  ✅ Cleared ${table}`)
      } catch (error) {
        // Table might not exist or have different name
        console.log(`  ⚠️  Could not clear ${table} (might not exist)`)
      }
    }

    // Import data in correct order
    console.log('\n📥 Importing data...')
    let totalImported = 0

    // ID mapping to track old -> new ID relationships
    const idMappings: { [table: string]: { [oldId: string]: string } } = {}

    for (const table of importOrder) {
      if (!exportData.tables[table]) {
        console.log(`  ⏭️  Skipping ${table} (no data in export)`)
        continue
      }

      try {
        const Entity = tableEntityMap[table]
        if (!Entity) {
          console.log(`  ⏭️  Skipping ${table} (no entity mapping)`)
          continue
        }

        const repository = dataSource.getRepository(Entity)
        const rows = exportData.tables[table]

        if (rows.length === 0) {
          console.log(`  ⏭️  Skipping ${table} (empty)`)
          continue
        }

        // Initialize ID mapping for this table
        idMappings[table] = {}

        // Process rows and map foreign keys
        const cleanedRows = rows.map((row: any) => {
          const cleaned: any = { ...row }
          const oldId = cleaned.id

          // Remove auto-generated fields
          delete cleaned.id
          delete cleaned.createdAt
          delete cleaned.updatedAt

          // Map foreign key references based on table
          if (table === 'users' && cleaned.agencyId) {
            // Map agencyId
            const agencyMapping = idMappings['agencies']
            if (agencyMapping && agencyMapping[cleaned.agencyId]) {
              cleaned.agencyId = agencyMapping[cleaned.agencyId]
            } else {
              // Agency not found, set to null (for super admin)
              cleaned.agencyId = null
            }
          } else if (table === 'clients' && cleaned.agencyId) {
            const agencyMapping = idMappings['agencies']
            if (agencyMapping && agencyMapping[cleaned.agencyId]) {
              cleaned.agencyId = agencyMapping[cleaned.agencyId]
            }
          } else if (table === 'projects') {
            if (cleaned.agencyId) {
              const agencyMapping = idMappings['agencies']
              if (agencyMapping && agencyMapping[cleaned.agencyId]) {
                cleaned.agencyId = agencyMapping[cleaned.agencyId]
              }
            }
            if (cleaned.clientId) {
              const clientMapping = idMappings['clients']
              if (clientMapping && clientMapping[cleaned.clientId]) {
                cleaned.clientId = clientMapping[cleaned.clientId]
              }
            }
          } else if (table === 'payments') {
            if (cleaned.agencyId) {
              const agencyMapping = idMappings['agencies']
              if (agencyMapping && agencyMapping[cleaned.agencyId]) {
                cleaned.agencyId = agencyMapping[cleaned.agencyId]
              }
            }
            if (cleaned.projectId) {
              const projectMapping = idMappings['projects']
              if (projectMapping && projectMapping[cleaned.projectId]) {
                cleaned.projectId = projectMapping[cleaned.projectId]
              }
            }
          } else if (table === 'hosting_services') {
            if (cleaned.agencyId) {
              const agencyMapping = idMappings['agencies']
              if (agencyMapping && agencyMapping[cleaned.agencyId]) {
                cleaned.agencyId = agencyMapping[cleaned.agencyId]
              }
            }
            if (cleaned.projectId) {
              const projectMapping = idMappings['projects']
              if (projectMapping && projectMapping[cleaned.projectId]) {
                cleaned.projectId = projectMapping[cleaned.projectId]
              }
            }
          } else if (table === 'invoices') {
            if (cleaned.agencyId) {
              const agencyMapping = idMappings['agencies']
              if (agencyMapping && agencyMapping[cleaned.agencyId]) {
                cleaned.agencyId = agencyMapping[cleaned.agencyId]
              }
            }
            if (cleaned.clientId) {
              const clientMapping = idMappings['clients']
              if (clientMapping && clientMapping[cleaned.clientId]) {
                cleaned.clientId = clientMapping[cleaned.clientId]
              }
            }
            if (cleaned.projectId) {
              const projectMapping = idMappings['projects']
              if (projectMapping && projectMapping[cleaned.projectId]) {
                cleaned.projectId = projectMapping[cleaned.projectId]
              }
            }
          } else if (table === 'invoice_items') {
            if (cleaned.invoiceId) {
              const invoiceMapping = idMappings['invoices']
              if (invoiceMapping && invoiceMapping[cleaned.invoiceId]) {
                cleaned.invoiceId = invoiceMapping[cleaned.invoiceId]
              }
            }
          } else if (table === 'reminders') {
            if (cleaned.agencyId) {
              const agencyMapping = idMappings['agencies']
              if (agencyMapping && agencyMapping[cleaned.agencyId]) {
                cleaned.agencyId = agencyMapping[cleaned.agencyId]
              }
            }
            if (cleaned.relatedEntityId && cleaned.relatedEntityType) {
              const relatedMapping = idMappings[cleaned.relatedEntityType + 's']
              if (relatedMapping && relatedMapping[cleaned.relatedEntityId]) {
                cleaned.relatedEntityId = relatedMapping[cleaned.relatedEntityId]
              }
            }
          } else if (table === 'client_notes') {
            if (cleaned.agencyId) {
              const agencyMapping = idMappings['agencies']
              if (agencyMapping && agencyMapping[cleaned.agencyId]) {
                cleaned.agencyId = agencyMapping[cleaned.agencyId]
              }
            }
            if (cleaned.clientId) {
              const clientMapping = idMappings['clients']
              if (clientMapping && clientMapping[cleaned.clientId]) {
                cleaned.clientId = clientMapping[cleaned.clientId]
              }
            }
            if (cleaned.createdById) {
              const userMapping = idMappings['users']
              if (userMapping && userMapping[cleaned.createdById]) {
                cleaned.createdById = userMapping[cleaned.createdById]
              }
            }
          } else if (table === 'notifications') {
            if (cleaned.agencyId) {
              const agencyMapping = idMappings['agencies']
              if (agencyMapping && agencyMapping[cleaned.agencyId]) {
                cleaned.agencyId = agencyMapping[cleaned.agencyId]
              }
            }
            if (cleaned.userId) {
              const userMapping = idMappings['users']
              if (userMapping && userMapping[cleaned.userId]) {
                cleaned.userId = userMapping[cleaned.userId]
              }
            }
            if (cleaned.relatedEntityId && cleaned.relatedEntityType) {
              const relatedTable = cleaned.relatedEntityType === 'hosting' ? 'hosting_services' : cleaned.relatedEntityType + 's'
              const relatedMapping = idMappings[relatedTable]
              if (relatedMapping && relatedMapping[cleaned.relatedEntityId]) {
                cleaned.relatedEntityId = relatedMapping[cleaned.relatedEntityId]
              }
            }
          }

          return { cleaned, oldId }
        })

        // Insert data and capture new IDs
        const savedRows = await repository.save(cleanedRows.map((item: any) => item.cleaned))
        
        // Map old IDs to new IDs
        savedRows.forEach((savedRow: any, index: number) => {
          const oldId = cleanedRows[index].oldId
          if (oldId && savedRow.id) {
            idMappings[table][oldId] = savedRow.id
          }
        })

        console.log(`  ✅ Imported ${rows.length} rows to ${table}`)
        totalImported += rows.length
      } catch (error) {
        console.error(`  ❌ Error importing ${table}:`, error)
        if (error instanceof Error) {
          console.error(`     ${error.message}`)
        }
      }
    }

    console.log(`\n✅ Import completed!`)
    console.log(`   Total records imported: ${totalImported}`)
    console.log(`\n📝 Note: IDs and timestamps were regenerated by the database`)
  } catch (error) {
    console.error('Error importing database:', error)
    throw error
  }
}

importToSupabase()
  .then(() => {
    console.log('\n✅ Import completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
