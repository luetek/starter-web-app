import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ValueTransformer,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import {
  ProgrammingActivitySubmissionWithStdioCheck,
  SubmissionSpecMetadata,
  SubmissionStatus,
  SubmissionType,
} from '@luetek/common-models';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { UserEntity } from '../../users/entities/user.entity';
import { ActivityEntity } from '../../activity/entities/activity.entity';
import { StoragePathEntity } from '../../storage-path/entities/storage-path.entity';

const submissionSpecTransformer: ValueTransformer = {
  /*
  Used to marshal data when writing to the database.
  */
  to: (value: SubmissionSpecMetadata): string => {
    return JSON.stringify(instanceToPlain(value));
  } /**

 /**
  * Used to unmarshal data when reading from the database.
  */,
  from: (value: string): SubmissionSpecMetadata => {
    const plainObj = JSON.parse(value) as SubmissionSpecMetadata;
    if (plainObj.type === SubmissionType.PROGRAMMING_ACTIVITY_STDIO__SUBMISSION)
      return plainToInstance(ProgrammingActivitySubmissionWithStdioCheck, plainObj);

    throw new Error('Unable to parse');
  },
};

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

  @AutoMap(() => String)
  @Column({
    type: 'simple-enum',
    enum: SubmissionStatus,
  })
  status: SubmissionStatus;

  @AutoMap(() => String)
  @Column({
    enum: SubmissionType,
    type: 'simple-enum',
    nullable: false,
  })
  type: SubmissionType;

  @AutoMap(() => SubmissionSpecMetadata)
  @Column({ type: 'varchar', length: 512, nullable: false, transformer: submissionSpecTransformer })
  submissionSpec: SubmissionSpecMetadata;

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
