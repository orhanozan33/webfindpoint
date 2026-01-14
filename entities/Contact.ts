import { Entity, Column } from 'typeorm'
import { BaseEntity } from './BaseEntity'

@Entity('contact_submissions')
export class Contact extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'varchar', length: 255 })
  email!: string

  @Column({ type: 'text' })
  message!: string

  @Column({ type: 'varchar', length: 50, default: 'new' })
  status!: string // 'new' | 'read' | 'replied' | 'archived'

  @Column({ type: 'text', nullable: true })
  adminNotes?: string
}