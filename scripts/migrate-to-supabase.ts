import { Client } from 'pg'
import * as bcrypt from 'bcryptjs'

/**
 * Script to migrate data from local database to Supabase
 * 
 * Usage:
 * 1. Make sure local database has data
 * 2. Update SUPABASE_DATABASE_URL in .env or pass as environment variable
 * 3. Run: npm run migrate-to-supabase
 */

async function migrateToSupabase() {
  // Local database connection
  const localClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '333333',
    database: process.env.DB_NAME || 'webfindpoint',
    ssl: false,
  })

  // Supabase connection
  const supabaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL
  if (!supabaseUrl) {
    console.error('❌ SUPABASE_DATABASE_URL or DATABASE_URL not found in environment variables')
    console.error('Please set SUPABASE_DATABASE_URL in .env file')
    process.exit(1)
  }

  const supabaseClient = new Client({
    connectionString: supabaseUrl,
    ssl: { rejectUnauthorized: false },
  })

  try {
    console.log('🔌 Connecting to local database...')
    await localClient.connect()
    console.log('✅ Connected to local database')

    console.log('🔌 Connecting to Supabase...')
    await supabaseClient.connect()
    console.log('✅ Connected to Supabase\n')

    // Migrate in order (respecting foreign keys)
    console.log('📦 Starting migration...\n')

    // 1. Agencies
    console.log('1️⃣  Migrating agencies...')
    const agencies = await localClient.query('SELECT * FROM agencies')
    if (agencies.rows.length > 0) {
      for (const agency of agencies.rows) {
        await supabaseClient.query(
          `INSERT INTO agencies (id, name, domain, logo, "defaultCurrency", "taxRate", "isActive", settings, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO NOTHING`,
          [
            agency.id,
            agency.name,
            agency.domain,
            agency.logo,
            agency.defaultCurrency || 'CAD',
            agency.taxRate || 0,
            agency.isActive !== undefined ? agency.isActive : true,
            agency.settings,
            agency.createdAt,
            agency.updatedAt,
          ]
        )
      }
      console.log(`   ✅ Migrated ${agencies.rows.length} agencies`)
    } else {
      console.log('   ⚠️  No agencies found in local database')
    }

    // 2. Users (passwords need to be re-hashed if plain text)
    console.log('\n2️⃣  Migrating users...')
    const users = await localClient.query('SELECT * FROM users')
    if (users.rows.length > 0) {
      for (const user of users.rows) {
        // If password is already hashed, use it; otherwise hash it
        let hashedPassword = user.password
        if (!user.password.startsWith('$2')) {
          // Not a bcrypt hash, hash it
          hashedPassword = await bcrypt.hash(user.password, 10)
        }

        await supabaseClient.query(
          `INSERT INTO users (id, email, password, name, role, "isActive", "agencyId", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (email) DO UPDATE SET
             password = EXCLUDED.password,
             name = EXCLUDED.name,
             role = EXCLUDED.role,
             "isActive" = EXCLUDED."isActive",
             "agencyId" = EXCLUDED."agencyId"`,
          [
            user.id,
            user.email,
            hashedPassword,
            user.name,
            user.role || 'staff',
            user.isActive !== undefined ? user.isActive : true,
            user.agencyId,
            user.createdAt,
            user.updatedAt,
          ]
        )
      }
      console.log(`   ✅ Migrated ${users.rows.length} users`)
    } else {
      console.log('   ⚠️  No users found in local database')
    }

    // 3. Clients
    console.log('\n3️⃣  Migrating clients...')
    const clients = await localClient.query('SELECT * FROM clients')
    if (clients.rows.length > 0) {
      for (const client of clients.rows) {
        await supabaseClient.query(
          `INSERT INTO clients (id, "agencyId", name, "companyName", email, phone, notes, status, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO NOTHING`,
          [
            client.id,
            client.agencyId,
            client.name,
            client.companyName,
            client.email,
            client.phone,
            client.notes,
            client.status || 'active',
            client.createdAt,
            client.updatedAt,
          ]
        )
      }
      console.log(`   ✅ Migrated ${clients.rows.length} clients`)
    } else {
      console.log('   ⚠️  No clients found in local database')
    }

    // 4. Projects
    console.log('\n4️⃣  Migrating projects...')
    const projects = await localClient.query('SELECT * FROM projects')
    if (projects.rows.length > 0) {
      for (const project of projects.rows) {
        await supabaseClient.query(
          `INSERT INTO projects (id, "agencyId", name, description, type, "startDate", "deliveryDate", status, price, currency, "clientId", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (id) DO NOTHING`,
          [
            project.id,
            project.agencyId,
            project.name,
            project.description,
            project.type,
            project.startDate,
            project.deliveryDate,
            project.status || 'planning',
            project.price,
            project.currency || 'CAD',
            project.clientId,
            project.createdAt,
            project.updatedAt,
          ]
        )
      }
      console.log(`   ✅ Migrated ${projects.rows.length} projects`)
    } else {
      console.log('   ⚠️  No projects found in local database')
    }

    // 5. Payments
    console.log('\n5️⃣  Migrating payments...')
    const payments = await localClient.query('SELECT * FROM payments')
    if (payments.rows.length > 0) {
      for (const payment of payments.rows) {
        await supabaseClient.query(
          `INSERT INTO payments (id, "agencyId", amount, currency, status, "paymentDate", notes, "projectId", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO NOTHING`,
          [
            payment.id,
            payment.agencyId,
            payment.amount,
            payment.currency || 'CAD',
            payment.status || 'unpaid',
            payment.paymentDate,
            payment.notes,
            payment.projectId,
            payment.createdAt,
            payment.updatedAt,
          ]
        )
      }
      console.log(`   ✅ Migrated ${payments.rows.length} payments`)
    } else {
      console.log('   ⚠️  No payments found in local database')
    }

    // 6. Hosting Services
    console.log('\n6️⃣  Migrating hosting services...')
    const hosting = await localClient.query('SELECT * FROM hosting_services')
    if (hosting.rows.length > 0) {
      for (const service of hosting.rows) {
        await supabaseClient.query(
          `INSERT INTO hosting_services (id, "agencyId", provider, plan, "startDate", "endDate", "autoRenew", "monthlyCost", currency, notes, "projectId", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (id) DO NOTHING`,
          [
            service.id,
            service.agencyId,
            service.provider,
            service.plan,
            service.startDate,
            service.endDate,
            service.autoRenew || false,
            service.monthlyCost,
            service.currency || 'CAD',
            service.notes,
            service.projectId,
            service.createdAt,
            service.updatedAt,
          ]
        )
      }
      console.log(`   ✅ Migrated ${hosting.rows.length} hosting services`)
    } else {
      console.log('   ⚠️  No hosting services found in local database')
    }

    // 7. Reminders
    console.log('\n7️⃣  Migrating reminders...')
    const reminders = await localClient.query('SELECT * FROM reminders')
    if (reminders.rows.length > 0) {
      for (const reminder of reminders.rows) {
        await supabaseClient.query(
          `INSERT INTO reminders (id, "agencyId", type, title, description, "dueDate", "isCompleted", "completedAt", "notificationStatus", "lastNotifiedAt", "notificationAttempts", "relatedEntityType", "relatedEntityId", "daysBeforeReminder", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           ON CONFLICT (id) DO NOTHING`,
          [
            reminder.id,
            reminder.agencyId,
            reminder.type,
            reminder.title,
            reminder.description,
            reminder.dueDate,
            reminder.isCompleted || false,
            reminder.completedAt,
            reminder.notificationStatus || 'pending',
            reminder.lastNotifiedAt,
            reminder.notificationAttempts || 0,
            reminder.relatedEntityType,
            reminder.relatedEntityId,
            reminder.daysBeforeReminder || 30,
            reminder.createdAt,
            reminder.updatedAt,
          ]
        )
      }
      console.log(`   ✅ Migrated ${reminders.rows.length} reminders`)
    } else {
      console.log('   ⚠️  No reminders found in local database')
    }

    // 8. Invoices
    console.log('\n8️⃣  Migrating invoices...')
    const invoices = await localClient.query('SELECT * FROM invoices')
    if (invoices.rows.length > 0) {
      for (const invoice of invoices.rows) {
        await supabaseClient.query(
          `INSERT INTO invoices (id, "agencyId", "invoiceNumber", "clientId", "projectId", "issueDate", "dueDate", subtotal, tax, total, currency, status, notes, "pdfPath", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           ON CONFLICT (id) DO NOTHING`,
          [
            invoice.id,
            invoice.agencyId,
            invoice.invoiceNumber,
            invoice.clientId,
            invoice.projectId,
            invoice.issueDate,
            invoice.dueDate,
            invoice.subtotal,
            invoice.tax || 0,
            invoice.total,
            invoice.currency || 'CAD',
            invoice.status || 'draft',
            invoice.notes,
            invoice.pdfPath,
            invoice.createdAt,
            invoice.updatedAt,
          ]
        )
      }
      console.log(`   ✅ Migrated ${invoices.rows.length} invoices`)
    } else {
      console.log('   ⚠️  No invoices found in local database')
    }

    // 9. Invoice Items
    console.log('\n9️⃣  Migrating invoice items...')
    const invoiceItems = await localClient.query('SELECT * FROM invoice_items')
    if (invoiceItems.rows.length > 0) {
      for (const item of invoiceItems.rows) {
        await supabaseClient.query(
          `INSERT INTO invoice_items (id, "invoiceId", description, quantity, "unitPrice", total, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO NOTHING`,
          [
            item.id,
            item.invoiceId,
            item.description,
            item.quantity,
            item.unitPrice,
            item.total,
            item.createdAt,
            item.updatedAt,
          ]
        )
      }
      console.log(`   ✅ Migrated ${invoiceItems.rows.length} invoice items`)
    } else {
      console.log('   ⚠️  No invoice items found in local database')
    }

    // 10. Client Notes
    console.log('\n🔟 Migrating client notes...')
    const notes = await localClient.query('SELECT * FROM client_notes')
    if (notes.rows.length > 0) {
      for (const note of notes.rows) {
        await supabaseClient.query(
          `INSERT INTO client_notes (id, "agencyId", "clientId", "createdById", content, "aiSummary", "aiSuggestions", "isAIGenerated", category, "isImportant", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO NOTHING`,
          [
            note.id,
            note.agencyId,
            note.clientId,
            note.createdById,
            note.content,
            note.aiSummary,
            note.aiSuggestions,
            note.isAIGenerated || false,
            note.category || 'general',
            note.isImportant || false,
            note.createdAt,
            note.updatedAt,
          ]
        )
      }
      console.log(`   ✅ Migrated ${notes.rows.length} client notes`)
    } else {
      console.log('   ⚠️  No client notes found in local database')
    }

    // 11. Notifications
    console.log('\n1️⃣1️⃣ Migrating notifications...')
    const notifications = await localClient.query('SELECT * FROM notifications')
    if (notifications.rows.length > 0) {
      for (const notification of notifications.rows) {
        await supabaseClient.query(
          `INSERT INTO notifications (id, "agencyId", "userId", type, title, message, link, "isRead", "readAt", severity, "relatedEntityType", "relatedEntityId", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (id) DO NOTHING`,
          [
            notification.id,
            notification.agencyId,
            notification.userId,
            notification.type,
            notification.title,
            notification.message,
            notification.link,
            notification.isRead || false,
            notification.readAt,
            notification.severity || 'info',
            notification.relatedEntityType,
            notification.relatedEntityId,
            notification.createdAt,
            notification.updatedAt,
          ]
        )
      }
      console.log(`   ✅ Migrated ${notifications.rows.length} notifications`)
    } else {
      console.log('   ⚠️  No notifications found in local database')
    }

    // 12. Portfolio
    console.log('\n1️⃣2️⃣ Migrating portfolio...')
    const portfolio = await localClient.query('SELECT * FROM portfolio')
    if (portfolio.rows.length > 0) {
      for (const item of portfolio.rows) {
        await supabaseClient.query(
          `INSERT INTO portfolio (id, title, "titleFr", "titleTr", description, "descriptionFr", "descriptionTr", image, technologies, category, "projectUrl", "isActive", "sortOrder", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           ON CONFLICT (id) DO NOTHING`,
          [
            item.id,
            item.title,
            item.titleFr,
            item.titleTr,
            item.description,
            item.descriptionFr,
            item.descriptionTr,
            item.image,
            Array.isArray(item.technologies) ? item.technologies.join(',') : item.technologies,
            item.category,
            item.projectUrl,
            item.isActive !== undefined ? item.isActive : true,
            item.sortOrder || 0,
            item.createdAt,
            item.updatedAt,
          ]
        )
      }
      console.log(`   ✅ Migrated ${portfolio.rows.length} portfolio items`)
    } else {
      console.log('   ⚠️  No portfolio items found in local database')
    }

    // 13. Contact Submissions
    console.log('\n1️⃣3️⃣ Migrating contact submissions...')
    const contacts = await localClient.query('SELECT * FROM contact_submissions')
    if (contacts.rows.length > 0) {
      for (const contact of contacts.rows) {
        await supabaseClient.query(
          `INSERT INTO contact_submissions (id, name, email, message, status, "adminNotes", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO NOTHING`,
          [
            contact.id,
            contact.name,
            contact.email,
            contact.message,
            contact.status || 'new',
            contact.adminNotes,
            contact.createdAt,
            contact.updatedAt,
          ]
        )
      }
      console.log(`   ✅ Migrated ${contacts.rows.length} contact submissions`)
    } else {
      console.log('   ⚠️  No contact submissions found in local database')
    }

    console.log('\n✅ Migration completed successfully!')
    console.log('📊 All data has been migrated to Supabase')

  } catch (error: any) {
    console.error('❌ Migration error:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  } finally {
    await localClient.end()
    await supabaseClient.end()
    console.log('\n🔌 Database connections closed')
    process.exit(0)
  }
}

// Run migration
migrateToSupabase()
