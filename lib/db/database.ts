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
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '333333',
  database: process.env.DB_NAME || 'webfindpoint',
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
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
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
  if (!isInitialized) {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
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