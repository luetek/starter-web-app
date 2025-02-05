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
import { UserEntity } from '../../users/entities/user.entity';
import { ActivityEntity } from '../../activity/entities/activity.entity';
import { StoragePathEntity } from '../../storage-path/entities/storage-path.entity';

@Entity()
export class SubmissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ActivityEntity)
  @JoinColumn()
  activity: ActivityEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

  @AutoMap()
  @Column({ name: 'parentId' })
  parentId: number;

  // Parent folder for the activity
  @AutoMap(() => StoragePathEntity)
  @ManyToOne(() => StoragePathEntity)
  @JoinColumn({ name: 'parentId' })
  parent: StoragePathEntity;

  @CreateDateColumn()
  createdAt: Date; // Creation date

  @UpdateDateColumn()
  updatedAt: Date; // Last updated date
}
