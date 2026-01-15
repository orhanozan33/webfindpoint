import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { HostingService } from './HostingService'

@Entity('projects')
export class Project extends BaseEntity {
  @Column({ type: 'uuid' })
  agencyId!: string

  // Use lazy loading to avoid circular dependency
  @ManyToOne(() => require('./Agency').Agency, (agency: any) => agency.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agencyId' })
  agency!: any

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'varchar', length: 100 })
  type!: string // 'website' | 'redesign' | 'seo' | 'maintenance' | etc.

  @Column({ type: 'date', nullable: true })
  startDate?: Date

  @Column({ type: 'date', nullable: true })
  deliveryDate?: Date

  @Column({ type: 'varchar', length: 50, default: 'planning' })
  status!: string // 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold'

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number

  @Column({ type: 'varchar', length: 10, default: 'CAD' })
  currency!: string

  @Column({ type: 'uuid' })
  clientId!: string

  // Use lazy loading to avoid circular dependency with Client
  @ManyToOne(() => require('./Client').Client, (client: any) => client.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client!: any

  // Use lazy loading to avoid circular dependency with Payment
  // Note: Don't specify inverse side to avoid cyclic dependency
  @OneToMany(() => require('./Payment').Payment, 'project')
  payments!: any[]

  @OneToMany(() => HostingService, (hosting) => hosting.project)
  hostingServices!: HostingService[]
}