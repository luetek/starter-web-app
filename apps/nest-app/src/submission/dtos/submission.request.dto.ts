export class SubmissionRequestDto {
  activityId: number;

  userId: number;

  // Evaluate this and store. Otherwise temporary
  final: boolean;

  // Programming-activity, Questionaire etc.
  type: string;
}
