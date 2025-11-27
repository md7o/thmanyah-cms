import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Episode } from '../../episode/entities/episode.entity';
import { ImportSource } from '../../import/entities/import-source.entity';

@Entity({ name: 'programs' })
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  language: string;

  @Column({ type: 'varchar', length: 255 })
  category: string;

  @Column({ type: 'timestamp' })
  publishDate: Date;

  @Column({ type: 'varchar', length: 50 })
  source: string;

  @OneToOne(() => ImportSource, { nullable: true })
  @JoinColumn()
  importSource: ImportSource;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Episode, (episode) => episode.program)
  episodes: Episode[];
}
