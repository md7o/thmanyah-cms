import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'import_sources' })
export class ImportSource {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'timestamp', nullable: true })
  lastImportedAt: Date;
}
