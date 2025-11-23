import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Program } from './program.entity';

@Entity({ name: 'tags' })
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToMany(() => Program, (program) => program.tags)
  programs: Program[];
}
