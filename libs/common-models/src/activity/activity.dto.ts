import { AutoMap } from '@automapper/classes';
import { Type } from 'class-transformer';
import { PaginationMeta } from '../paginate/paginate.dto';
import { Activity, ActivityCollection, ActivityType } from './activity.interface';
import { CollectionSection } from './common';
import { StoragePathDto } from '../storage-path/storage-path.dto';
import { ActivitySpecMetadata, ProgrammingActivityWithStdioCheck, ReadingActivity } from './activity-spec-metadata';

export class ActivityDto implements Activity {
  @AutoMap()
  id!: number;

  @AutoMap()
  title!: string;

  @AutoMap()
  description!: string;

  @AutoMap(() => StoragePathDto)
  parent!: StoragePathDto;

  // See entity for persistence to db
  @Type(() => ActivitySpecMetadata, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: ProgrammingActivityWithStdioCheck, name: ActivityType.READING_ACTIVITY },
        { value: ReadingActivity, name: ActivityType.READING_ACTIVITY },
      ],
    },
  })
  @AutoMap(() => ActivitySpecMetadata)
  activitySpec!: ActivitySpecMetadata;

  @AutoMap()
  keywords!: string[];

  @AutoMap()
  collectionId!: number;

  @AutoMap()
  orderId!: number;

  @AutoMap()
  sectionId!: number;
}

export class CreateActivityCollectionRequestDto {
  @AutoMap()
  readableId: string;

  @AutoMap()
  title: string;

  @AutoMap()
  description: string;

  @AutoMap()
  keywords: string[];

  @AutoMap()
  authors: string[];
}

export class ActivityCollectionDto implements ActivityCollection {
  @AutoMap()
  id!: number;

  @AutoMap()
  readableId: string;

  @AutoMap()
  title!: string;

  @AutoMap()
  description!: string;

  // In a given folder there can be only one Collection
  @AutoMap()
  parent: StoragePathDto;

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
