import { AutoMap } from '@automapper/classes';
import { IsEnum } from 'class-validator';
import { ActivitySpec, ActivityType } from './activity.interface';

export class ActivitySpecMetadata implements ActivitySpec {
  @AutoMap()
  @IsEnum(ActivityType)
  type!: ActivityType;
}

export class ProgrammingActivityWithStdioCheck extends ActivitySpecMetadata {
  @AutoMap()
  inputSrcMainFile!: string;

  @AutoMap()
  descriptionFile!: string;

  @AutoMap()
  languagesSupported!: string;

  @AutoMap()
  checkerSrcMainFile!: string;

  @AutoMap()
  testInputFiles: string[];
}

export class ReadingActivity extends ActivitySpecMetadata {
  @AutoMap()
  fileFormat!: string;

  files: string[];
}
