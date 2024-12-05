import { AutoMap } from '@automapper/classes';
import {
  ActivitySpecMetadata,
  ActivityType,
  ProgrammingActivityWithStdioCheck,
  ReadingActivity,
} from '@luetek/common-models';
import { Type } from 'class-transformer';

export class ActivityJson {
  @AutoMap()
  readableId: string;

  @AutoMap()
  title!: string;

  @AutoMap()
  description!: string;

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

  @AutoMap(() => [String])
  keywords!: string[];

  @AutoMap()
  orderId!: number;

  @AutoMap()
  sectionId!: number;
}
