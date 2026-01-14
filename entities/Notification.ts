import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from './BaseEntity'

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column({ type: 'uuid' })
  agencyId!: string

  // Use lazy loading to avoid circular dependency
  @ManyToOne(() => require('./Agency').Agency, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agencyId' })
  agency!: any

  @Column({ type: 'uuid', nullable: true })
  userId?: string

  // Use lazy loading to avoid circular dependency
  @ManyToOne(() => require('./User').User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: any

  @Column({ type: 'varchar', length: 100 })
  type!: string // 'hosting_expiration' | 'service_renewal' | 'payment_due' | 'invoice_overdue' | 'project_deadline'

  @Column({ type: 'varchar', length: 255 })
  title!: string

  @Column({ type: 'text', nullable: true })
  message?: string

  @Column({ type: 'varchar', length: 500, nullable: true })
  link?: string

  @Column({ type: 'boolean', default: false })
  isRead!: boolean

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date

  @Column({ type: 'varchar', length: 50, default: 'info' })
  severity!: string // 'info' | 'warning' | 'error' | 'success'

  @Column({ type: 'varchar', length: 50, nullable: true })
  relatedEntityType?: string // 'project' | 'client' | 'invoice' | 'hosting' | 'reminder'

  @Column({ type: 'uuid', nullable: true })
  relatedEntityId?: string
}