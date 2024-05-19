import { Injectable } from '@nestjs/common';
import { StorageChangeEvent, StorageChangeHandler } from '@luetek/common-models';
import { ReqLogger } from '../logger/req-logger';

@Injectable()
export class StoragePublicationService {
  handlers: StorageChangeHandler[] = [];

  constructor(private logger: ReqLogger) {
    this.logger.setContext(StoragePublicationService.name);
  }

  register(handler: StorageChangeHandler) {
    // if (this.handlers.some((h) => h === handler)) return;
    this.handlers.push(handler);
    this.logger.log(`Handler Added count = ${this.handlers.length}`);
  }

  unregister(handler: StorageChangeHandler) {
    const idx = this.handlers.findIndex((h) => h === handler);
    if (!idx) {
      this.handlers.splice(idx, 1);
    }
  }

  async publish(event: StorageChangeEvent) {
    this.logger.log(`Publishing to ${this.handlers.length} handlers, event =  ${JSON.stringify(event)}`);
    await Promise.all(
      this.handlers.map(async (handler) => {
        return handler.handleChange(event);
      })
    );
  }
}
