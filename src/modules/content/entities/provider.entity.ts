import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Program } from './program.entity';

@Entity({ name: 'providers' })
export class Provider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  config?: Record<string, any>;

  @OneToMany(() => Program, (program) => program.provider)
  programs: Program[];
}
