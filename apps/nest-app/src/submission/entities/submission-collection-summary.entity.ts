import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ActivityCollectionEntity } from '../../activity/entities/activity-collection.entity';

// TODO:: add composite key
@Entity()
export class SubmissionCollectionSummaryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => ActivityCollectionEntity)
  @JoinColumn()
  collection: ActivityCollectionEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date; // Creation date

  @UpdateDateColumn()
  updatedAt: Date; // Last updated date
}
