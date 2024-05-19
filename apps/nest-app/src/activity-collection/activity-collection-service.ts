import { Injectable } from '@nestjs/common';
import { ActivityCollectionJsonEntity } from './json-entities/activity-collection.entity';
import { ReqLogger } from '../logger/req-logger';

@Injectable()
export class ActivityCollectionService {
  private map: Map<string, ActivityCollectionJsonEntity> = new Map();

  constructor(private logger: ReqLogger) {
    this.logger.setContext(ActivityCollectionService.name);
  }

  // TODO:: Add validations
  addOrUpdate(activityCollection: ActivityCollectionJsonEntity) {
    this.map.set(activityCollection.id, activityCollection);
  }

  async findAll(): Promise<ActivityCollectionJsonEntity[]> {
    return Promise.resolve([...this.map.values()]);
  }
}
