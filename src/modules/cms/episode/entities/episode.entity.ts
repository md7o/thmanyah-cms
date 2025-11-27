import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Program } from '../../program/entities/program.entity';

@Entity({ name: 'episodes' })
export class Episode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  programId: string;

  @ManyToOne(() => Program, (program) => program.episodes)
  @JoinColumn({ name: 'programId' })
  program: Program;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalId: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'timestamp' })
  publishDate: Date;

  @Column({ type: 'int' })
  episodeNumber: number;
}
