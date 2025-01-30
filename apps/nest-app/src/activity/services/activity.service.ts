import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { ActivityDto, CreateActivityRequestDto } from '@luetek/common-models';
import { InjectRepository } from '@nestjs/typeorm';
import { Mapper } from '@automapper/core';
import { ActivityCollectionEntity } from '../entities/activity-collection.entity';
import { ActivityEntity } from '../entities/activity.entity';
import { ReqLogger } from '../../logger/req-logger';

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
    activity.readableId = createReq.readableId;
    activity.title = createReq.title;
    activity.type = createReq.type;

    this.logger.log(`create request recieved ${JSON.stringify(createReq)}`);
    const res = await this.activityRepository.save(activity);
    return this.mapper.map(res, ActivityEntity, ActivityDto);
  }

  async update(collectionId: number, id: number, updateReq: ActivityDto) {
    this.logger.log(`update request recieved ${JSON.stringify(updateReq)}`);
    const activity = await this.activityRepository.findOneOrFail({
      where: { id, collectionId },
      relations: ['parent'],
    });
    activity.activitySpec = updateReq.activitySpec;
    activity.description = updateReq.description;
    activity.keywords = updateReq.keywords;
    activity.readableId = updateReq.readableId;
    activity.title = updateReq.title;

    const res = await this.activityRepository.save(activity);
    return this.mapper.map(res, ActivityEntity, ActivityDto);
  }

  async findAll(collectionId: number): Promise<ActivityDto[]> {
    const res = await this.activityRepository.find({ where: { collectionId }, relations: ['parent'] });
    return this.mapper.mapArray(res, ActivityEntity, ActivityDto);
  }
}
