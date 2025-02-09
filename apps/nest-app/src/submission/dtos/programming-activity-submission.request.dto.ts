import { ExecutionEnvironment } from '@luetek/common-models';

export class ProgrammingActivitySubmissionRequestDto {
  activityId: number;

  userId: number;

  // Evaluate this and store. Otherwise temporary
  final: boolean;

  inputSrcMainFile!: string;

  environment!: ExecutionEnvironment;
}
