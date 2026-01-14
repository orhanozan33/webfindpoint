import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from './BaseEntity'

@Entity('reminders')
export class Reminder extends BaseEntity {
  @Column({ type: 'uuid' })
  agencyId!: string

  // Use lazy loading to avoid circular dependency
  @ManyToOne(() => require('./Agency').Agency, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agencyId' })
  agency!: any

  @Column({ type: 'varchar', length: 100 })
  type!: string // 'hosting_expiration' | 'service_renewal' | 'payment_due' | 'custom'

  @Column({ type: 'varchar', length: 255 })
  title!: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'date' })
  dueDate!: Date

  @Column({ type: 'boolean', default: false })
  isCompleted!: boolean

  @Column({ type: 'date', nullable: true })
  completedAt?: Date

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  notificationStatus!: string // 'pending' | 'sent' | 'failed'

  @Column({ type: 'timestamp', nullable: true })
  lastNotifiedAt?: Date

  @Column({ type: 'int', default: 0 })
  notificationAttempts!: number

  @Column({ type: 'varchar', length: 50, nullable: true })
  relatedEntityType?: string // 'project' | 'client' | 'hosting' | null

  @Column({ type: 'uuid', nullable: true })
  relatedEntityId?: string

  @Column({ type: 'int', default: 30 })
  daysBeforeReminder!: number // How many days before due date to remind
}