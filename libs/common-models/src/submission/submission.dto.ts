import { AutoMap } from '@automapper/classes';
import { StoragePathDto } from '../storage-path/storage-path.dto';
import { SubmissionStatus, SubmissionType } from './submission.interface';
import { SubmissionSpecMetadata } from './submission-spec-metadata';

export class SubmissionDto {
  @AutoMap()
  id!: number;

  @AutoMap()
  activityId!: number;

  @AutoMap()
  userId!: number;

  @AutoMap(() => String)
  status!: SubmissionStatus;

  @AutoMap(() => String)
  type!: SubmissionType;

  @AutoMap(() => SubmissionSpecMetadata)
  submissionSpec: SubmissionSpecMetadata;

  // Parent folder for the activity
  @AutoMap(() => StoragePathDto)
  parent!: StoragePathDto;

  @AutoMap()
  parentId!: number;

  @AutoMap()
  createdAt!: Date; // Creation date

  @AutoMap()
  updatedAt!: Date; // Last updated date
}
