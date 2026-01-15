import 'reflect-metadata'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { Client } from 'pg'

// Load .env.local file
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function checkDatabaseTables(dbName: string) {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '333333',
    database: dbName,
  })

  try {
    await client.connect()
    console.log(`\n📊 Checking database: ${dbName}`)
    
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)

    if (result.rows.length > 0) {
      console.log(`✅ Found ${result.rows.length} tables:`)
      result.rows.forEach(row => {
        console.log(`   - ${row.table_name}`)
      })
      
      // Check row counts
      console.log(`\n📈 Row counts:`)
      for (const row of result.rows) {
        const countResult = await client.query(`SELECT COUNT(*) as count FROM ${row.table_name}`)
        console.log(`   ${row.table_name}: ${countResult.rows[0].count} rows`)
      }
    } else {
      console.log(`⚠️  No tables found`)
    }

    await client.end()
    return result.rows.length > 0
  } catch (error) {
    console.error(`❌ Error checking ${dbName}:`, error instanceof Error ? error.message : error)
    return false
  }
}

async function main() {
  const databases = ['webfindpoint', 'findpoint_db', 'findpoint']
  
  for (const db of databases) {
    await checkDatabaseTables(db)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
