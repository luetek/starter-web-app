/* eslint-disable import/no-cycle */
import { Activity, ActivitySpecMetadata } from '@luetek/common-models';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { ActivityCollectionEntity } from './activity-collection.entity';
import { StoragePathEntity } from '../../storage-path/entities/storage-path.entity';

@Entity()
export class ActivityEntity implements Activity {
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

  // Parent folder for the activity
  @AutoMap()
  @ManyToOne(() => StoragePathEntity)
  @JoinColumn({ name: 'parentId' })
  parent: StoragePathEntity;

  // Ancestor for the activity collection
  @AutoMap()
  @ManyToOne(() => ActivityCollectionEntity)
  @JoinColumn({ name: 'collectionId' })
  collection: ActivityCollectionEntity;

  @AutoMap()
  @Column({ name: 'collectionId' })
  collectionId: number;

  @AutoMap(() => ActivitySpecMetadata)
  @Column({ type: 'simple-json', nullable: true })
  activitySpec: ActivitySpecMetadata;

  @AutoMap()
  @Column({ type: 'simple-array' })
  keywords: string[];

  @AutoMap()
  @Column({ type: 'int' })
  orderId: number;

  @AutoMap()
  @Column({ type: 'int' })
  sectionId: number;
}
