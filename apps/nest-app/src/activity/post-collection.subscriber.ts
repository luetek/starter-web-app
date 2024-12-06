import { DataSource, EntitySubscriberInterface, InsertEvent, Repository, UpdateEvent } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { CreateFolderRequestDto } from '@luetek/common-models';
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ActivityCollectionEntity } from './entities/activity-collection.entity';
import { FileSystemService } from '../storage/file-system.service';
import { ActivityCollectionJson } from './json-models/activity-collection.json';
import { StoragePathEntity } from '../storage-path/entities/storage-path.entity';
import { ReqLogger } from '../logger/req-logger';
/**
 * Event subscriber is responsible to making file structure changes based on event along with backuping data in json files.
 *
 * Issues - https://github.com/nestjs/docs.nestjs.com/issues/412
 */
@Injectable()
export class ActivityCollectionSubscriber implements EntitySubscriberInterface<ActivityCollectionEntity> {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    @InjectRepository(StoragePathEntity) private storagePathRepository: Repository<StoragePathEntity>,
    private fileSystemService: FileSystemService,
    @InjectMapper() private mapper: Mapper,
    private logger: ReqLogger
  ) {
    dataSource.subscribers.push(this);
    this.logger.setContext(ActivityCollectionSubscriber.name);
  }

  // TODO:: In the future maybe we want collection on a per user basis. In such scenario we need to have account folder for each user.

  /**
   * Indicates that this subscriber only listen to Post events.
   */
  listenTo() {
    return ActivityCollectionEntity;
  }

  /**
   * Called before post insertion.
   */
  async beforeInsert(event: InsertEvent<ActivityCollectionEntity>) {
    this.logger.log(`Before ActivityCollection Inserted : ${event.entity.readableId}`);
    const { entity } = event;
    const JsonOvj = this.mapper.map(event.entity, ActivityCollectionEntity, ActivityCollectionJson);

    const collectionFolder = await this.fileSystemService.createRootDirectory('collections');
    const createFolderRequest = new CreateFolderRequestDto();
    createFolderRequest.name = event.entity.readableId;
    createFolderRequest.parentId = collectionFolder.id;
    const parentFolder = await this.fileSystemService.createDirectory(createFolderRequest);
    this.logger.log(`Folder created ${JSON.stringify(parentFolder)}`);
    entity.parent = await this.storagePathRepository.findOneOrFail({ where: { id: parentFolder.id } });
    await this.fileSystemService.saveAsJson(parentFolder.id, 'collection.json', JsonOvj);
  }

  async beforeUpdate(event: UpdateEvent<ActivityCollectionEntity>) {
    this.logger.log(`After ActivityCollection Inserted : ${event.entity}`);
  }
}
