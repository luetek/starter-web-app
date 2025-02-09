import { AutoMap } from '@automapper/classes';
import { StoragePathDto } from '../storage-path/storage-path.dto';

export enum SubmissionStatus {
  CREATED = 'CREATED',
  EVALUATING = 'EVALUATING',
  DONE = 'DONE',
}

export const PROGRAMMING_ACTIVITY_STDIN_SUBMISSION_TYPE = 'programming-activity-stdin';

export class SubmissionDto {
  @AutoMap()
  id!: number;

  @AutoMap()
  activityId!: number;

  @AutoMap()
  userId!: number;

  @AutoMap(() => String)
  status!: SubmissionStatus;

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
