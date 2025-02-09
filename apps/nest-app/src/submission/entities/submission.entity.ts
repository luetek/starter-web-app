import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { SubmissionStatus } from '@luetek/common-models';
import { UserEntity } from '../../users/entities/user.entity';
import { ActivityEntity } from '../../activity/entities/activity.entity';
import { StoragePathEntity } from '../../storage-path/entities/storage-path.entity';

@Entity()
export class SubmissionEntity {
  @AutoMap()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ActivityEntity)
  @JoinColumn({ name: 'activityId' })
  activity: ActivityEntity;

  @AutoMap()
  @Column({ name: 'activityId' })
  activityId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

  @AutoMap()
  @Column({ name: 'userId' })
  userId: number;

  @AutoMap()
  @Column({
    type: 'simple-enum',
    enum: SubmissionStatus,
  })
  status: SubmissionStatus;

  @AutoMap()
  @Column()
  type: string;

  // Parent folder for the activity
  @AutoMap(() => StoragePathEntity)
  @ManyToOne(() => StoragePathEntity)
  @JoinColumn({ name: 'parentId' })
  parent: StoragePathEntity;

  @AutoMap()
  @Column({ name: 'parentId' })
  parentId: number;

  @AutoMap()
  @CreateDateColumn()
  createdAt: Date; // Creation date

  @AutoMap()
  @UpdateDateColumn()
  updatedAt: Date; // Last updated date
}
