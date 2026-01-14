import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { BaseEntity } from './BaseEntity'

@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column({ type: 'uuid' })
  agencyId!: string

  // Use lazy loading to avoid circular dependency
  @ManyToOne(() => require('./Agency').Agency, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agencyId' })
  agency!: any

  @Column({ type: 'varchar', length: 50, unique: true })
  invoiceNumber!: string

  @Column({ type: 'uuid' })
  clientId!: string

  // Use lazy loading to avoid circular dependency
  @ManyToOne(() => require('./Client').Client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client!: any

  @Column({ type: 'uuid', nullable: true })
  projectId?: string

  // Use lazy loading to avoid circular dependency
  @ManyToOne(() => require('./Project').Project, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'projectId' })
  project?: any

  @Column({ type: 'date' })
  issueDate!: Date

  @Column({ type: 'date' })
  dueDate!: Date

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal!: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax!: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total!: number

  @Column({ type: 'varchar', length: 10, default: 'CAD' })
  currency!: string

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status!: string // 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

  @Column({ type: 'text', nullable: true })
  notes?: string

  @Column({ type: 'varchar', length: 500, nullable: true })
  pdfPath?: string

  // Use lazy loading to avoid circular dependency with InvoiceItem
  @OneToMany(() => require('./InvoiceItem').InvoiceItem, (item: any) => item.invoice, { cascade: true })
  items!: any[]
}