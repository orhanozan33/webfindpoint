import 'reflect-metadata'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { Client } from 'pg'

// Load .env.local file
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function listDatabases() {
  // Connect to PostgreSQL (default postgres database)
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '333333',
    database: 'postgres', // Connect to default postgres database
  })

  try {
    console.log('Connecting to PostgreSQL...')
    await client.connect()
    console.log('✅ Connected to PostgreSQL\n')

    // List all databases
    const result = await client.query(`
      SELECT datname 
      FROM pg_database 
      WHERE datistemplate = false
      ORDER BY datname
    `)

    console.log('📊 Available databases:')
    console.log('─'.repeat(50))
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.datname}`)
    })
    console.log('─'.repeat(50))
    console.log(`\nTotal: ${result.rows.length} databases`)

    await client.end()
  } catch (error) {
    console.error('Error listing databases:', error)
    if (error instanceof Error) {
      if (error.message.includes('password authentication failed')) {
        console.error('\n❌ Password authentication failed!')
        console.error('Please check your PostgreSQL password in .env.local')
      } else if (error.message.includes('ECONNREFUSED')) {
        console.error('\n❌ Could not connect to PostgreSQL!')
        console.error('Please make sure PostgreSQL is running')
      } else {
        console.error('\n❌ Error:', error.message)
      }
    }
    throw error
  }
}

listDatabases()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
