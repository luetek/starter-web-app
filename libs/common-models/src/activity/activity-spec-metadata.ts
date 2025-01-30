import { AutoMap } from '@automapper/classes';
import { IsEnum } from 'class-validator';
import { ActivitySpec, ActivityType } from './activity.interface';
import { StoragePathDto } from '../storage-path/storage-path.dto';

export class ActivitySpecMetadata implements ActivitySpec {
  constructor(type: ActivityType) {
    this.type = type;
  }

  @AutoMap()
  @IsEnum(ActivityType)
  readonly type: ActivityType;
}

export class ProgrammingActivityWithStdioCheck extends ActivitySpecMetadata {
  constructor() {
    super(ActivityType.PROGRAMMING_ACTIVITY_STDIO_CHECK);
  }

  @AutoMap()
  inputSrcMainFile!: string;

  @AutoMap()
  descriptionFile!: string;

  @AutoMap()
  languagesSupported!: string;

  @AutoMap()
  checkerSrcMainFile!: string;

  @AutoMap()
  testInputFiles!: string[];
}

export class ReadingActivity extends ActivitySpecMetadata {
  constructor() {
    super(ActivityType.READING_ACTIVITY);
  }

  @AutoMap()
  files!: StoragePathDto[];
}
