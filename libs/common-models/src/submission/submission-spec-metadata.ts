import { AutoMap } from '@automapper/classes';
import { IsEnum } from 'class-validator';
import { SubmissionSpec, SubmissionType } from './submission.interface';
import { ExecutionEnvironment } from '../program-executor/common';

export class SubmissionSpecMetadata implements SubmissionSpec {
  constructor(type: SubmissionType) {
    this.type = type;
  }

  @AutoMap()
  @IsEnum(SubmissionType)
  readonly type: SubmissionType;
}

export class ProgrammingOutputCompareTestResult {
  inputFile!: string;

  passed!: boolean;

  returnCode!: number;

  errorFile?: string;

  userOutputFile?: string;

  testOutputFile: string;
}

export class ProgrammingActivitySubmissionWithStdioCheck extends SubmissionSpecMetadata {
  constructor() {
    super(SubmissionType.PROGRAMMING_ACTIVITY_STDIO__SUBMISSION);
  }

  @AutoMap()
  inputSrcMainFile!: string;

  @AutoMap()
  environment!: ExecutionEnvironment;

  @AutoMap()
  accepted?: boolean;

  @AutoMap()
  results?: ProgrammingOutputCompareTestResult[];
}
