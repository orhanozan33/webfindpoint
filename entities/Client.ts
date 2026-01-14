import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from './BaseEntity'

@Entity('clients')
export class Client extends BaseEntity {
  @Column({ type: 'uuid' })
  agencyId!: string

  // Use lazy loading to avoid circular dependency
  @ManyToOne(() => require('./Agency').Agency, (agency: any) => agency.clients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agencyId' })
  agency!: any

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  companyName?: string

  @Column({ type: 'varchar', length: 255 })
  email!: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string

  @Column({ type: 'text', nullable: true })
  notes?: string

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string // 'active' | 'inactive'

  // Use lazy loading to avoid circular dependency with Project
  @OneToMany(() => require('./Project').Project, (project: any) => project.client)
  projects!: any[]
}