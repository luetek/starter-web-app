import {
  BeforeInsert,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ActivityEntity } from '../../activity/entities/activity.entity';

// TODO:: add composite key
@Entity()
export class SubmissionActivitySummaryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @BeforeInsert()
  newid() {
    this.id = this.activity.id;
  }

  @OneToOne(() => ActivityEntity)
  @JoinColumn()
  activity: ActivityEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date; // Creation date

  @UpdateDateColumn()
  updatedAt: Date; // Last updated date
}
