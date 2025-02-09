import { EventPayload } from '../../event/event-payload';

export class SubmissionEventPayload implements EventPayload {
  type: string;

  submissionId: number;
}
