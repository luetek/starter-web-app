import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { ActivityCollectionDto, CreateActivityCollectionRequestDto } from '@luetek/common-models';
import { InjectRepository } from '@nestjs/typeorm';
import { Mapper } from '@automapper/core';
import { ReqLogger } from '../logger/req-logger';
import { ActivityCollectionEntity } from './entities/activity-collection.entity';

/**
 * Service is only responsible for storing data in db. Other action will happen based on the event subscriber.
 * Event subscriber is responsible to making file structure changes based on event along with backuping data in json files.
 * @see ActivityCollectionSubscriber
 */
@Injectable()
export class ActivityCollectionService {
  constructor(
    @InjectMapper() private mapper: Mapper,
    @InjectRepository(ActivityCollectionEntity)
    private activityCollectionRepository: Repository<ActivityCollectionEntity>,
    private logger: ReqLogger
  ) {
    this.logger.setContext(ActivityCollectionService.name);
  }

  async create(createReq: CreateActivityCollectionRequestDto): Promise<ActivityCollectionDto> {
    const collection = new ActivityCollectionEntity();
    collection.readableId = createReq.readableId;
    collection.title = createReq.title;
    collection.description = createReq.description;
    collection.authors = createReq.authors;
    collection.keywords = createReq.keywords;
    collection.sections = [];
    this.logger.log(`create request recieved ${JSON.stringify(collection)}`);
    const res = await this.activityCollectionRepository.save(collection);
    return this.mapper.map(res, ActivityCollectionEntity, ActivityCollectionDto);
  }

  async update(updateReq: ActivityCollectionDto) {
    const collection = await this.activityCollectionRepository.findOneOrFail({ where: { id: updateReq.id } });
    if (updateReq.readableId !== collection.readableId) {
      throw new BadRequestException('readableId is readOnly');
    }
    // eslint-disable-next-line no-param-reassign
    updateReq.parent = collection.parent;
    // eslint-disable-next-line no-param-reassign
    updateReq.activities = collection.activities;
    const res = await this.activityCollectionRepository.save(updateReq);
    return this.mapper.map(res, ActivityCollectionEntity, ActivityCollectionDto);
  }

  async findAll(): Promise<ActivityCollectionDto[]> {
    const res = await this.activityCollectionRepository.find();
    return this.mapper.mapArray(res, ActivityCollectionEntity, ActivityCollectionDto);
  }
}
