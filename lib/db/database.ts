import { DataSource } from 'typeorm'
import { Portfolio } from '@/entities/Portfolio'
import { Contact } from '@/entities/Contact'
import { User } from '@/entities/User'
import { Client } from '@/entities/Client'
import { Project } from '@/entities/Project'
import { Payment } from '@/entities/Payment'
import { HostingService } from '@/entities/HostingService'
import { Reminder } from '@/entities/Reminder'
import { Invoice } from '@/entities/Invoice'
import { InvoiceItem } from '@/entities/InvoiceItem'
import { ClientNote } from '@/entities/ClientNote'
import { Agency } from '@/entities/Agency'
import { Notification } from '@/entities/Notification'

// PostgreSQL configuration for TypeORM
// Support both connection string and individual parameters
const getDbConfig = () => {
  // If connection string is provided, use it
  if (process.env.DATABASE_URL) {
    return {
      url: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }
  }

  // Otherwise use individual parameters
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '333333',
    database: process.env.DB_NAME || 'webfindpoint',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  }
}

const dbConfig = getDbConfig()

// Debug: Log database config (without password)
if (process.env.NODE_ENV === 'development') {
  if (dbConfig.url) {
    // Parse connection string for logging (hide password)
    const urlObj = new URL(dbConfig.url.replace('postgresql://', 'https://'))
    console.log('📊 Database Config:', {
      host: urlObj.hostname,
      port: urlObj.port || '5432',
      database: urlObj.pathname.replace('/', ''),
      ssl: dbConfig.ssl ? 'enabled' : 'disabled',
      connectionString: 'using DATABASE_URL',
    })
  } else {
    console.log('📊 Database Config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      database: dbConfig.database,
      ssl: dbConfig.ssl ? 'enabled' : 'disabled',
    })
  }
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(dbConfig.url 
    ? { url: dbConfig.url, ssl: dbConfig.ssl }
    : {
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        ssl: dbConfig.ssl,
      }
  ),
  synchronize: process.env.NODE_ENV !== 'production', // Auto-sync schema in development only
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false, // Reduced logging
  entities: [
    Agency,
    User,
    Client,
    Project,
    Payment,
    HostingService,
    Reminder,
    Contact,
    Portfolio,
    Invoice,
    InvoiceItem,
    ClientNote,
    Notification,
  ],
  migrations: [__dirname + '/../migrations/**/*.ts'],
  ssl: dbConfig.ssl,
  // Performance optimizations
  extra: {
    max: 20, // Maximum number of connections in the pool
    min: 5, // Minimum number of connections in the pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
  },
  poolSize: 20, // Connection pool size
})

let isInitialized = false

// Initialize connection (call this in your API routes or server components)
export async function initializeDatabase() {
  // Skip database initialization during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('Database initialization skipped during build')
  }

  // Check if environment variables are set
  if (!process.env.DATABASE_URL) {
    if (!process.env.DB_HOST || process.env.DB_HOST === 'localhost') {
      // In development, allow localhost but warn
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  Warning: DB_HOST is localhost. Make sure your .env file is configured correctly.')
      } else {
        // In production, localhost is not allowed
        throw new Error('DB_HOST cannot be localhost in production. Please set a valid database host or use DATABASE_URL.')
      }
    }
  }

  if (!isInitialized) {
    if (!AppDataSource.isInitialized) {
      try {
        await AppDataSource.initialize()
      } catch (error: any) {
        // If connection fails, log error but don't crash during build
        if (process.env.NEXT_PHASE === 'phase-production-build') {
          console.warn('Database connection skipped during build:', error.message)
          throw new Error('Database connection skipped during build')
        }
        throw error
      }
    }
    isInitialized = true
  }
  return AppDataSource
}

// Close connection (useful for cleanup)
export async function closeDatabase() {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy()
    isInitialized = false
  }
}