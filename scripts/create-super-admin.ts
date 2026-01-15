import 'reflect-metadata'
import { initializeDatabase } from '../lib/db/database'
import { User } from '../entities/User'
import * as bcrypt from 'bcryptjs'

async function createSuperAdmin() {
  try {
    console.log('Initializing database...')
    
    // Initialize database
    const dataSource = await initializeDatabase()
    console.log('Database initialized')

    const userRepository = dataSource.getRepository(User)

    const email = 'orhanozan33@gmail.com'
    const password = '33333333'

    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: { email },
    })

    if (existingUser) {
      console.log('User already exists. Updating password and role...')
      existingUser.password = await bcrypt.hash(password, 10)
      existingUser.role = 'super_admin'
      existingUser.isActive = true
      existingUser.agencyId = undefined // Super admin has no agency
      await userRepository.save(existingUser)
      console.log('\n✅ Super admin updated successfully!')
      console.log(`Email: ${email}`)
      console.log(`Password: ${password}`)
      console.log(`Role: super_admin`)
    } else {
      // Create super admin user
      const hashedPassword = await bcrypt.hash(password, 10)
      const superAdmin = userRepository.create({
        email,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'super_admin',
        isActive: true,
        // Super admin doesn't need an agency
        agencyId: undefined,
      })

      await userRepository.save(superAdmin)
      console.log('\n✅ Super admin created successfully!')
      console.log(`Email: ${email}`)
      console.log(`Password: ${password}`)
      console.log(`Role: super_admin`)
      console.log('\nAccess admin panel at: http://localhost:3000/admin')
    }
  } catch (error) {
    console.error('Error creating super admin:', error)
    throw error
  }
}

createSuperAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })