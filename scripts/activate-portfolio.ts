import 'reflect-metadata'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { initializeDatabase } from '../lib/db/database'
import { Portfolio } from '../entities/Portfolio'

// Load .env.local file
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function activatePortfolio() {
  try {
    console.log('Connecting to Supabase...')
    const dataSource = await initializeDatabase()
    console.log('✅ Connected to Supabase\n')

    const portfolioRepo = dataSource.getRepository(Portfolio)
    const portfolios = await portfolioRepo.find()
    
    if (portfolios.length === 0) {
      console.log('❌ No portfolio items found')
      return
    }

    console.log(`Found ${portfolios.length} portfolio item(s)`)
    
    for (const portfolio of portfolios) {
      if (!portfolio.isActive) {
        portfolio.isActive = true
        await portfolioRepo.save(portfolio)
        console.log(`✅ Activated: ${portfolio.title}`)
      } else {
        console.log(`✓ Already active: ${portfolio.title}`)
      }
    }

    console.log('\n✅ Portfolio activation completed!')
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

activatePortfolio()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
