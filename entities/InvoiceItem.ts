import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from './BaseEntity'

@Entity('invoice_items')
export class InvoiceItem extends BaseEntity {
  @Column({ type: 'uuid' })
  invoiceId!: string

  // Use lazy loading to avoid circular dependency with Invoice
  @ManyToOne(() => require('./Invoice').Invoice, (invoice: any) => invoice.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice!: any

  @Column({ type: 'varchar', length: 255 })
  description!: string

  @Column({ type: 'int' })
  quantity!: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total!: number
}