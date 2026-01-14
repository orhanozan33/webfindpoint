import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from './BaseEntity'

@Entity('payments')
export class Payment extends BaseEntity {
  @Column({ type: 'uuid' })
  agencyId!: string

  // Use lazy loading to avoid circular dependency
  @ManyToOne(() => require('./Agency').Agency, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agencyId' })
  agency!: any

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number

  @Column({ type: 'varchar', length: 10, default: 'CAD' })
  currency!: string

  @Column({ type: 'varchar', length: 50, default: 'unpaid' })
  status!: string // 'paid' | 'partial' | 'unpaid'

  @Column({ type: 'date', nullable: true })
  paymentDate?: Date

  @Column({ type: 'text', nullable: true })
  notes?: string

  @Column({ type: 'uuid' })
  projectId!: string

  // Use lazy loading to avoid circular dependency with Project
  @ManyToOne(() => require('./Project').Project, (project: any) => project.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project!: any
}