import 'reflect-metadata'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { Client } from 'pg'

// Load .env.local file
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function findAllData() {
  // Connect to PostgreSQL (default postgres database)
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '333333',
    database: 'postgres',
  })

  try {
    console.log('Connecting to PostgreSQL...')
    await client.connect()
    console.log('✅ Connected to PostgreSQL\n')

    // List all databases
    const dbResult = await client.query(`
      SELECT datname 
      FROM pg_database 
      WHERE datistemplate = false
      ORDER BY datname
    `)

    console.log('📊 Searching in all databases...\n')

    for (const dbRow of dbResult.rows) {
      const dbName = dbRow.datname
      if (dbName === 'postgres') continue

      console.log(`\n${'='.repeat(60)}`)
      console.log(`🔍 Database: ${dbName}`)
      console.log('='.repeat(60))

      try {
        // Connect to this database
        const dbClient = new Client({
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          user: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || '333333',
          database: dbName,
        })

        await dbClient.connect()

        // Get all tables
        const tablesResult = await dbClient.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `)

        const tables = tablesResult.rows.map(row => row.table_name)

        // Check for relevant tables
        const relevantTables = ['portfolio', 'clients', 'projects', 'reminders', 'payments', 'hosting_services', 'invoices', 'users', 'agencies']
        
        for (const table of tables) {
          if (relevantTables.includes(table) || table.includes('portfolio') || table.includes('client') || table.includes('project') || table.includes('reminder')) {
            const countResult = await dbClient.query(`SELECT COUNT(*) as count FROM ${table}`)
            const count = parseInt(countResult.rows[0].count)
            
            if (count > 0) {
              console.log(`\n  📋 Table: ${table}`)
              console.log(`     Rows: ${count}`)
              
              // Show sample data for portfolio
              if (table === 'portfolio' && count > 0) {
                const dataResult = await dbClient.query(`SELECT id, title, "createdAt" FROM ${table} ORDER BY "createdAt" DESC LIMIT 10`)
                console.log(`     Sample data:`)
                dataResult.rows.forEach((row: any, idx: number) => {
                  console.log(`       ${idx + 1}. ${row.title || row.id} (${new Date(row.createdAt).toLocaleDateString()})`)
                })
              }
              
              // Show sample data for clients
              if (table === 'clients' && count > 0) {
                const dataResult = await dbClient.query(`SELECT id, name, "companyName", "createdAt" FROM ${table} ORDER BY "createdAt" DESC LIMIT 10`)
                console.log(`     Sample data:`)
                dataResult.rows.forEach((row: any, idx: number) => {
                  console.log(`       ${idx + 1}. ${row.name} - ${row.companyName || 'N/A'} (${new Date(row.createdAt).toLocaleDateString()})`)
                })
              }
              
              // Show sample data for reminders
              if (table === 'reminders' && count > 0) {
                const dataResult = await dbClient.query(`SELECT id, title, type, "dueDate" FROM ${table} ORDER BY "createdAt" DESC LIMIT 10`)
                console.log(`     Sample data:`)
                dataResult.rows.forEach((row: any, idx: number) => {
                  console.log(`       ${idx + 1}. ${row.title} (${row.type}) - Due: ${new Date(row.dueDate).toLocaleDateString()}`)
                })
              }
            }
          }
        }

        await dbClient.end()
      } catch (error) {
        console.log(`  ⚠️  Could not access database: ${error instanceof Error ? error.message : error}`)
      }
    }

    await client.end()
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

findAllData()
  .then(() => {
    console.log('\n✅ Search completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
