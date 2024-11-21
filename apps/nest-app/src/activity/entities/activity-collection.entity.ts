/* eslint-disable import/no-cycle */
/* eslint-disable @nx/enforce-module-boundaries */
import { ActivityCollection, CollectionSection } from '@luetek/common-models';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AutoMap } from '@automapper/classes';

import { ActivityEntity } from './activity.entity';
import { StoragePathEntity } from '../../storage-path/entities/storage-path.entity';

@Entity()
export class ActivityCollectionEntity implements ActivityCollection {
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
  @ManyToOne(() => StoragePathEntity)
  @JoinColumn({ name: 'parentId' })
  parent: StoragePathEntity;

  @AutoMap(() => [ActivityEntity])
  @OneToMany(() => ActivityEntity, (activity) => activity.collection)
  activities: ActivityEntity[];

  @AutoMap()
  @Column({ type: 'simple-array' })
  keywords: string[];

  @AutoMap()
  @Column({ type: 'simple-array' })
  authors: string[];

  @AutoMap()
  @Column({ type: 'simple-json' })
  sections: CollectionSection[];
}
