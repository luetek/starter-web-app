/* eslint-disable import/no-cycle */
/* eslint-disable @nx/enforce-module-boundaries */
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AutoMap } from '@automapper/classes';

import { FolderEntity } from '../../storage/entities/folder.entity';

@Entity()
export class CollectionEntity {
  @AutoMap()
  @PrimaryGeneratedColumn()
  id: number;

  @AutoMap()
  @Column({ unique: true })
  readableId: string;

  @AutoMap()
  @Column()
  title: string;

  @AutoMap()
  @Column()
  description: string;

  @AutoMap()
  @Column({ type: 'simple-array' })
  keywords: string[];

  @AutoMap()
  @Column({ type: 'simple-array' })
  authors: string[];

  @OneToOne(() => FolderEntity)
  @JoinColumn()
  rootFolder: FolderEntity;

  @Column()
  readOnly: boolean;
}
