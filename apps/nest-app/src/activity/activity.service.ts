import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { ActivityCollectionDto, ActivityDto, CreateActivityRequestDto } from '@luetek/common-models';
import { InjectRepository } from '@nestjs/typeorm';
import { Mapper } from '@automapper/core';
import { ReqLogger } from '../logger/req-logger';
import { ActivityCollectionEntity } from './entities/activity-collection.entity';
import { ActivityEntity } from './entities/activity.entity';

/**
 * Service is only responsible for storing data in db. Other action will happen based on the event subscriber.
 * Event subscriber is responsible to making file structure changes based on event along with backuping data in json files.
 * @see ActivitySubscriber
 */
@Injectable()
export class ActivityService {
  constructor(
    @InjectMapper() private mapper: Mapper,
    @InjectRepository(ActivityCollectionEntity)
    private activityCollectionRepository: Repository<ActivityCollectionEntity>,
    @InjectRepository(ActivityEntity)
    private activityRepository: Repository<ActivityEntity>,
    private logger: ReqLogger
  ) {
    this.logger.setContext(ActivityService.name);
  }

  async create(collectionId: number, createReq: CreateActivityRequestDto): Promise<ActivityDto> {
    const collection = await this.activityCollectionRepository.findOneOrFail({ where: { id: collectionId } });
    const activity = new ActivityEntity();
    activity.collection = collection;
    activity.activitySpec = createReq.activitySpec;
    activity.description = createReq.description;
    activity.keywords = createReq.keywords;
    activity.orderId = createReq.orderId;
    activity.readableId = createReq.readableId;
    activity.sectionId = createReq.sectionId; // TODO:: Validate this.
    activity.title = createReq.title;
    this.logger.log(`create request recieved ${JSON.stringify(activity)}`);
    const res = await this.activityRepository.save(activity);
    return this.mapper.map(res, ActivityEntity, ActivityDto);
  }

  async findAll(collectionId: number): Promise<ActivityDto[]> {
    const parent = await this.activityCollectionRepository.findOneOrFail({ where: { id: collectionId } });
    const res = await this.activityRepository.find({ where: { parent } });
    return this.mapper.mapArray(res, ActivityEntity, ActivityDto);
  }
}
