import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from './BaseEntity'

@Entity('client_notes')
export class ClientNote extends BaseEntity {
  @Column({ type: 'uuid' })
  agencyId!: string

  // Use lazy loading to avoid circular dependency
  @ManyToOne(() => require('./Agency').Agency, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agencyId' })
  agency!: any

  @Column({ type: 'uuid' })
  clientId!: string

  // Use lazy loading to avoid circular dependency
  @ManyToOne(() => require('./Client').Client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client!: any

  @Column({ type: 'uuid' })
  createdById!: string

  // Use lazy loading to avoid circular dependency
  @ManyToOne(() => require('./User').User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy!: any

  @Column({ type: 'text' })
  content!: string

  @Column({ type: 'text', nullable: true })
  aiSummary?: string

  @Column({ type: 'text', nullable: true })
  aiSuggestions?: string

  @Column({ type: 'boolean', default: false })
  isAIGenerated!: boolean

  @Column({ type: 'varchar', length: 50, default: 'general' })
  category!: string // 'general' | 'meeting' | 'payment' | 'project' | 'risk'

  @Column({ type: 'boolean', default: false })
  isImportant!: boolean
}