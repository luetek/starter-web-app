import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import { PaginationMeta } from '../paginate/paginate.dto';
import { Activity, ActivityCollection, ActivityType } from './activity.interface';
import { CollectionSection } from './common';
import { StoragePathDto } from '../storage-path/storage-path.dto';
import { ActivitySpecMetadata, ProgrammingActivityWithStdioCheck, ReadingActivity } from './activity-spec-metadata';

export class CreateActivityRequestDto {
  @AutoMap()
  title!: string;

  @AutoMap()
  readableId!: string;

  @AutoMap()
  description!: string;

  @AutoMap()
  type!: ActivityType;

  // See entity for persistence to db
  @Type((opts) =>
    opts?.object?.type === ActivityType.PROGRAMMING_ACTIVITY_STDIO_CHECK
      ? ProgrammingActivityWithStdioCheck
      : ReadingActivity
  )
  @AutoMap(() => ActivitySpecMetadata)
  activitySpec!: ActivitySpecMetadata;

  @AutoMap()
  keywords!: string[];

  @AutoMap()
  collectionId!: number;
}

export class ActivityDto implements Activity {
  @AutoMap()
  id!: number;

  @AutoMap()
  readableId!: string;

  @AutoMap()
  title!: string;

  @AutoMap()
  description!: string;

  @AutoMap(() => StoragePathDto)
  parent!: StoragePathDto;

  @AutoMap()
  type!: ActivityType;

  // See entity for persistence to db
  @Type((opts) =>
    opts?.object?.type === ActivityType.PROGRAMMING_ACTIVITY_STDIO_CHECK
      ? ProgrammingActivityWithStdioCheck
      : ReadingActivity
  )
  @AutoMap(() => ActivitySpecMetadata)
  activitySpec!: ActivitySpecMetadata;

  @AutoMap(() => [String])
  keywords!: string[];

  @AutoMap()
  collectionId!: number;
}

export class CreateActivityCollectionRequestDto {
  @AutoMap()
  readableId!: string;

  @AutoMap()
  title!: string;

  @AutoMap()
  description!: string;

  @AutoMap()
  keywords!: string[];

  @AutoMap()
  authors!: string[];
}

export class ActivityCollectionDto implements ActivityCollection {
  @AutoMap()
  id!: number;

  @AutoMap()
  readableId!: string;

  @AutoMap()
  title!: string;

  @AutoMap()
  description!: string;

  // In a given folder there can be only one Collection
  @AutoMap()
  parent!: StoragePathDto;

  @AutoMap(() => [ActivityDto])
  activities!: ActivityDto[];

  @AutoMap(() => [String])
  @AutoMap()
  authors!: string[];

  @AutoMap(() => [String])
  @AutoMap()
  keywords!: string[];

  @AutoMap(() => [CollectionSection])
  sections!: CollectionSection[];
}

export class PaginatedActivityDto {
  @AutoMap(() => [ActivityDto])
  data!: ActivityDto[];

  @AutoMap(() => PaginationMeta)
  meta!: PaginationMeta;
}

export class PaginatedActivityCollectionDto {
  @AutoMap(() => [ActivityCollectionDto])
  data!: ActivityCollectionDto[];

  @AutoMap(() => PaginationMeta)
  meta!: PaginationMeta;
}
