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

  @AutoMap()
  type: ActivityType;

  // See entity for persistence to db
  @Type((opts) =>
    opts.object.type === ActivityType.PROGRAMMING_ACTIVITY_STDIO_CHECK
      ? ProgrammingActivityWithStdioCheck
      : ReadingActivity
  )
  @AutoMap(() => ActivitySpecMetadata)
  activitySpec!: ActivitySpecMetadata;

  @AutoMap(() => [String])
  keywords!: string[];

  @AutoMap()
  orderId!: number;

  @AutoMap()
  sectionId!: number;
}
