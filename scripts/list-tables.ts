import { initializeDatabase } from '../lib/db/database'

/**
 * Script to list all tables in the local database
 */
async function listTables() {
  try {
    // Force development mode for local script
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'development'
    }
    
    console.log('🔌 Connecting to database...')
    const dataSource = await initializeDatabase()
    
    if (!dataSource.isInitialized) {
      await dataSource.initialize()
    }

    console.log('✅ Database connected successfully\n')

    // Get all entity metadata (what TypeORM knows about)
    const entityMetadatas = dataSource.entityMetadatas
    console.log('📊 TypeORM Entities (Expected Tables):')
    console.log('=' .repeat(60))
    entityMetadatas.forEach((metadata, index) => {
      console.log(`${index + 1}. ${metadata.tableName}`)
      console.log(`   Entity: ${metadata.name}`)
      console.log(`   Columns: ${metadata.columns.length}`)
      console.log('')
    })

    // Query actual database tables (only user tables, exclude system schemas)
    console.log('\n🗄️  Actual Database Tables (User Tables Only):')
    console.log('=' .repeat(60))
    
    const queryRunner = dataSource.createQueryRunner()
    const allTables = await queryRunner.getTables()
    
    // Filter out system tables (pg_catalog, information_schema)
    const userTables = allTables.filter(table => {
      const schema = table.schema || 'public'
      return schema === 'public' && 
             !table.name.startsWith('pg_') && 
             !table.name.includes('information_schema')
    })
    
    if (userTables.length === 0) {
      console.log('⚠️  No user tables found in database!')
      console.log('💡 Run the setup endpoint to create tables:')
      console.log('   POST /api/setup')
    } else {
      userTables.forEach((table, index) => {
        console.log(`${index + 1}. ${table.name}`)
        console.log(`   Columns: ${table.columns.length}`)
        console.log(`   Indices: ${table.indices.length}`)
        console.log(`   Foreign Keys: ${table.foreignKeys.length}`)
        if (table.foreignKeys.length > 0) {
          table.foreignKeys.forEach(fk => {
            console.log(`      → ${fk.columnNames.join(', ')} → ${fk.referencedTableName}.${fk.referencedColumnNames.join(', ')}`)
          })
        }
        console.log('')
      })
    }

    // Compare expected vs actual
    console.log('\n📋 Comparison:')
    console.log('=' .repeat(60))
    const expectedTableNames = entityMetadatas.map(m => m.tableName)
    const actualTableNames = userTables.map(t => t.name)
    
    const missing = expectedTableNames.filter(name => !actualTableNames.includes(name))
    const extra = actualTableNames.filter(name => !expectedTableNames.includes(name))
    
    console.log(`Expected tables: ${expectedTableNames.length}`)
    console.log(`Actual tables: ${actualTableNames.length}`)
    
    if (missing.length > 0) {
      console.log(`\n⚠️  Missing tables (not created yet):`)
      missing.forEach(name => console.log(`   - ${name}`))
    }
    
    if (extra.length > 0) {
      console.log(`\nℹ️  Extra tables (not in entities):`)
      extra.forEach(name => console.log(`   - ${name}`))
    }
    
    if (missing.length === 0 && extra.length === 0) {
      console.log('\n✅ All expected tables exist!')
    }

    await queryRunner.release()
    await dataSource.destroy()
    
    console.log('\n✅ Done!')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

// Run the script
listTables()
