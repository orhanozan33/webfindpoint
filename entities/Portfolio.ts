import { Entity, Column } from 'typeorm'
import { BaseEntity } from './BaseEntity'

@Entity('portfolio')
export class Portfolio extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title!: string

  @Column({ type: 'varchar', length: 255 })
  titleFr!: string

  @Column({ type: 'varchar', length: 255 })
  titleTr!: string

  @Column({ type: 'text' })
  description!: string

  @Column({ type: 'text' })
  descriptionFr!: string

  @Column({ type: 'text' })
  descriptionTr!: string

  @Column({ type: 'varchar', length: 500, nullable: true })
  image?: string

  @Column({ type: 'simple-array', nullable: true })
  technologies?: string[]

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string

  @Column({ type: 'varchar', length: 500, nullable: true })
  projectUrl?: string

  @Column({ type: 'boolean', default: true })
  isActive!: boolean

  @Column({ type: 'int', default: 0 })
  sortOrder!: number
}