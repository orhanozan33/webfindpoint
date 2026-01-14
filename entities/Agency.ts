import { Entity, Column, OneToMany } from 'typeorm'
import { BaseEntity } from './BaseEntity'

@Entity('agencies')
export class Agency extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  domain?: string

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo?: string

  @Column({ type: 'varchar', length: 10, default: 'CAD' })
  defaultCurrency!: string

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate!: number

  @Column({ type: 'boolean', default: true })
  isActive!: boolean

  @Column({ type: 'text', nullable: true })
  settings?: string // JSON string for custom settings

  // Use lazy loading to avoid circular dependency
  @OneToMany(() => require('./User').User, (user: any) => user.agency)
  users!: any[]

  @OneToMany(() => require('./Client').Client, (client: any) => client.agency)
  clients!: any[]

  @OneToMany(() => require('./Project').Project, (project: any) => project.agency)
  projects!: any[]
}