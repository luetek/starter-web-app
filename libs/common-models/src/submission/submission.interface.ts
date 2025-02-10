export enum SubmissionType {
  PROGRAMMING_ACTIVITY_STDIO__SUBMISSION = 'PROGRAMMING_ACTIVITY_STDIO_SUBMISSION',
}

export enum SubmissionStatus {
  CREATED = 'CREATED',
  EVALUATING = 'EVALUATING',
  DONE = 'DONE',
}

export interface SubmissionSpec {
  type: SubmissionType;
}
