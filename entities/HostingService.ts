import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from './BaseEntity'

@Entity('hosting_services')
export class HostingService extends BaseEntity {
  @Column({ type: 'uuid' })
  agencyId!: string

  // Use lazy loading to avoid circular dependency
  @ManyToOne(() => require('./Agency').Agency, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agencyId' })
  agency!: any

  @Column({ type: 'varchar', length: 255 })
  provider!: string

  @Column({ type: 'varchar', length: 500, nullable: true })
  plan?: string

  @Column({ type: 'date' })
  startDate!: Date

  @Column({ type: 'date', nullable: true })
  endDate?: Date

  @Column({ type: 'boolean', default: false })
  autoRenew!: boolean

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthlyCost?: number

  @Column({ type: 'varchar', length: 10, default: 'CAD' })
  currency!: string

  @Column({ type: 'text', nullable: true })
  notes?: string

  @Column({ type: 'uuid', nullable: true })
  projectId?: string

  // Use lazy loading to avoid circular dependency with Project
  @ManyToOne(() => require('./Project').Project, (project: any) => project.hostingServices, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'projectId' })
  project?: any
}