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

export class ActivityCollectionDto implements ActivityCollection {
  @AutoMap()
  id!: number;

  @AutoMap()
  title!: string;

  @AutoMap()
  description!: string;

  @AutoMap(() => [ActivityDto])
  activities!: ActivityDto[];

  @AutoMap()
  authors!: string[];

  @AutoMap()
  keywords!: string[];

  @AutoMap()
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
