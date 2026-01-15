import { Entity, Column, BeforeInsert, BeforeUpdate, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from './BaseEntity'
import * as bcrypt from 'bcryptjs'

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string

  @Column({ type: 'varchar', length: 255 })
  password!: string

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'varchar', length: 50, default: 'staff' })
  role!: 'super_admin' | 'admin' | 'staff'

  @Column({ type: 'boolean', default: true })
  isActive!: boolean

  @Column({ type: 'uuid', nullable: true })
  agencyId?: string

  // Use lazy loading to avoid circular dependency
  @ManyToOne(() => require('./Agency').Agency, (agency: any) => agency.users, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'agencyId' })
  agency?: any

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Only hash if password is new or changed (not already hashed)
    // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
    if (this.password && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10)
    }
  }

  async comparePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password)
  }
}