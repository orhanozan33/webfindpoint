import { Client } from 'pg'

async function createDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '333333',
    database: 'postgres', // Connect to default postgres database first
  })

  try {
    await client.connect()
    console.log('Connected to PostgreSQL')

    const dbName = process.env.DB_NAME || 'webfindpoint'
    
    // Check if database exists
    const checkResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    )

    if (checkResult.rows.length > 0) {
      console.log(`✅ Database "${dbName}" already exists`)
    } else {
      // Create database
      await client.query(`CREATE DATABASE ${dbName}`)
      console.log(`✅ Database "${dbName}" created successfully!`)
    }

    await client.end()
    console.log('\nNext steps:')
    console.log(`1. Update .env.local: DB_NAME=${dbName}`)
    console.log('2. Run: npm run seed')
    console.log('3. Start server: npm run dev')
  } catch (error) {
    console.error('Error creating database:', error)
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
    process.exit(1)
  }
}

createDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })