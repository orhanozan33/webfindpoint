import 'reflect-metadata'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { Client } from 'pg'
import * as fs from 'fs'

// Load .env.local file
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function exportLocalDatabase() {
  // Local PostgreSQL connection
  // Try webfindpoint first, then fallback to DB_NAME from env
  const dbName = process.env.DB_NAME || 'webfindpoint'
  const localClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '333333',
    database: dbName,
  })

  try {
    console.log('Connecting to local PostgreSQL...')
    await localClient.connect()
    console.log('✅ Connected to local database')

    // Get all tables
    const tablesResult = await localClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)

    const tables = tablesResult.rows.map(row => row.table_name)
    console.log(`\nFound ${tables.length} tables:`, tables.join(', '))

    const exportData: any = {
      exportedAt: new Date().toISOString(),
      tables: {} as any,
    }

    // Export data from each table
    for (const table of tables) {
      console.log(`\nExporting ${table}...`)
      
      // Get all data
      const dataResult = await localClient.query(`SELECT * FROM ${table}`)
      exportData.tables[table] = dataResult.rows
      
      console.log(`  ✅ Exported ${dataResult.rows.length} rows from ${table}`)
    }

    // Save to JSON file
    const exportFile = path.resolve(__dirname, '../local-db-export.json')
    fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2))
    console.log(`\n✅ Export saved to: ${exportFile}`)
    console.log(`\nTotal records exported: ${Object.values(exportData.tables).reduce((sum: number, rows: any) => sum + rows.length, 0)}`)

    await localClient.end()
  } catch (error) {
    console.error('Error exporting database:', error)
    if (error instanceof Error) {
      if (error.message.includes('password authentication failed')) {
        console.error('\n❌ Password authentication failed!')
        console.error('Please check your PostgreSQL password in .env.local')
      } else if (error.message.includes('ECONNREFUSED')) {
        console.error('\n❌ Could not connect to PostgreSQL!')
        console.error('Please make sure PostgreSQL is running')
      } else if (error.message.includes('does not exist')) {
        console.error('\n❌ Database does not exist!')
        console.error(`Please check DB_NAME in .env.local (current: ${dbName})`)
        console.error('\n💡 Run "npm run list-databases" to see available databases')
        console.error('💡 Or run "npm run check-db-tables" to check which database has your data')
      } else {
        console.error('\n❌ Error:', error.message)
      }
    }
    throw error
  }
}

exportLocalDatabase()
  .then(() => {
    console.log('\n✅ Export completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
