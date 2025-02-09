import { EventProcessor } from '../event/event-processor';
import { ReqLogger } from '../logger/req-logger';
import { SubmissionEventPayload } from '../submission/dtos/submission-event.payload';
import { ProgramExecuterService } from './program-executer.service';

export class SubmissionEventProcessor implements EventProcessor {
  constructor(
    private programExecuterService: ProgramExecuterService,
    private logger: ReqLogger
  ) {}

  async process(payload: SubmissionEventPayload) {
    this.logger.log('Processing done');
    this.logger.log(JSON.stringify(payload));
  }
}
