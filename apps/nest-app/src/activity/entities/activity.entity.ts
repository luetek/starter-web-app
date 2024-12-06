/* eslint-disable import/no-cycle */
import {
  Activity,
  ActivitySpecMetadata,
  ActivityType,
  ProgrammingActivityWithStdioCheck,
  ReadingActivity,
} from '@luetek/common-models';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, ValueTransformer } from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ActivityCollectionEntity } from './activity-collection.entity';
import { StoragePathEntity } from '../../storage-path/entities/storage-path.entity';

const activitySpecTransformer: ValueTransformer = {
  /*
  Used to marshal data when writing to the database.
  */
  to: (value: ActivitySpecMetadata): string => {
    return JSON.stringify(instanceToPlain(value));
  } /**

 /**
  * Used to unmarshal data when reading from the database.
  */,
  from: (value: string): ActivitySpecMetadata => {
    const plainObj = JSON.parse(value) as ActivitySpecMetadata;
    if (plainObj.type === ActivityType.PROGRAMMING_ACTIVITY_STDIO_CHECK)
      return plainToInstance(ProgrammingActivityWithStdioCheck, plainObj);
    if (plainObj.type === ActivityType.READING_ACTIVITY) return plainToInstance(ReadingActivity, plainObj);

    throw new Error('Unable to parse');
  },
};

@Entity()
@Index('readable_id_UNIQUE', ['readableId', 'collectionId'], { unique: true })
export class ActivityEntity implements Activity {
  @AutoMap()
  @PrimaryGeneratedColumn()
  id: number;

  @AutoMap()
  @Column({ name: 'readableId', unique: true })
  readableId: string;

  @AutoMap()
  @Column()
  title: string;

  @AutoMap()
  @Column()
  description: string;

  @AutoMap()
  @Column({ name: 'parentId' })
  parentId: number;

  // Parent folder for the activity
  @AutoMap(() => StoragePathEntity)
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

  @AutoMap()
  @Column({
    enum: ActivityType,
    nullable: false,
  })
  type: ActivityType;

  @AutoMap(() => ActivitySpecMetadata)
  @Column({ type: 'varchar', length: 512, nullable: false, transformer: activitySpecTransformer })
  activitySpec: ActivitySpecMetadata;

  @AutoMap(() => [String])
  @Column({ type: 'simple-array' })
  keywords: string[];

  @AutoMap()
  @Column({ type: 'int' })
  orderId: number;

  @AutoMap()
  @Column({ type: 'int' })
  sectionId: number;
}
