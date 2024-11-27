import { Injectable, UseInterceptors } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ReqLogger } from '../logger/req-logger';

import { ActivityCollectionEntity } from './entities/activity-collection.entity';
import { MapInterceptor } from '@automapper/nestjs';

@Injectable()
export class ActivityCollectionService {
  constructor(
    private activityCollectionRepository: Repository<ActivityCollectionEntity>,
    private logger: ReqLogger
  ) {
    this.logger.setContext(ActivityCollectionService.name);
  }

  @UseInterceptors(MapInterceptor(ActivityCollectionEntity, ActivityCollectionDto, { isArray: true }))
  async findAll(): Promise<ActivityCollectionJsonEntity[]> {
    return this.activityCollectionRepository.find();
  }
}
