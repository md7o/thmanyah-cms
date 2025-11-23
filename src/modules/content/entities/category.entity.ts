import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Program } from './program.entity';

@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @OneToMany(() => Program, (program) => program.category)
  programs: Program[];
}
