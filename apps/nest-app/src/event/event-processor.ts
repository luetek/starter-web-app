import { EventPayload } from './event-payload';

export interface EventProcessor {
  process(payload: EventPayload);
}
