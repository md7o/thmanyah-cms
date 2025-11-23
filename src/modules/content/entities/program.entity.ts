import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinTable,
  ManyToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Tag } from './tag.entity';
import { Provider } from './provider.entity';
import { Category } from './category.entity';

@Entity({ name: 'contents' })
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', name: 'media_url', nullable: true })
  mediaUrl?: string;

  @Column({ type: 'int', name: 'duration_seconds', nullable: true })
  durationSeconds?: number;

  @Column({
    type: 'timestamp with time zone',
    name: 'published_at',
    nullable: true,
  })
  publishedAt?: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  language?: string;

  @Column({ type: 'int', name: 'category_id', nullable: true })
  categoryId?: number;

  @Column({ type: 'int', name: 'provider_id', nullable: true })
  providerId?: number;

  @Column({ type: 'varchar', length: 255, name: 'external_id', nullable: true })
  externalId?: string;

  // Relationships

  @ManyToOne(() => Category, (category) => category.programs)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Provider, (provider) => provider.programs)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @ManyToMany(() => Tag, (tag) => tag.programs, { cascade: true })
  @JoinTable({
    name: 'program_tags',
    joinColumn: { name: 'program_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];
}
