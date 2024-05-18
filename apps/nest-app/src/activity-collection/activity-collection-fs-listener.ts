import { Injectable } from '@nestjs/common';
import {
  FileAddedEvent,
  StorageChangeEvent,
  StorageChangeHandler,
  deserializeActivityCollection,
} from '@luetek/common-models';
import { Readable } from 'readable-stream';
import { StoragePublicationService } from '../storage/storage-publication.service';
import { ReqLogger } from '../logger/req-logger';
import { StorageStreamingService } from '../storage/storage-streaming.service';
import { FileEntity } from '../storage/entities/file.entity';
import { ActivityCollectionService } from './activity-collection-service';
import { ActivityCollectionJsonEntity } from './json-entities/activity-collection.entity';
import { FileService } from '../storage/file.service';

function streamToString(stream: Readable) {
  const chunks = [];
  return new Promise<string>((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

@Injectable()
export class ActivityCollectionListernerFsListener implements StorageChangeHandler {
  constructor(
    private storagePublicationService: StoragePublicationService,
    private storageStreamingService: StorageStreamingService,
    private fileService: FileService,
    private activityCollectionService: ActivityCollectionService,
    private logger: ReqLogger
  ) {
    this.logger.setContext(ActivityCollectionListernerFsListener.name);
    this.storagePublicationService.register(this);
  }

  async handleFileAdded(event: FileAddedEvent) {
    const { file } = event;
    const fileEntity = file as FileEntity;
    if (file.name.endsWith('.json')) {
      const readableStream = await this.storageStreamingService.fetchAsStream(fileEntity);
      const jsonData = await streamToString(readableStream);
      const obj = deserializeActivityCollection(jsonData);
      if (!obj) return; // skip
      const jsonEntity = new ActivityCollectionJsonEntity();
      jsonEntity.id = obj.id;
      jsonEntity.keywords = obj.keywords;
      jsonEntity.descriptionFile = await this.fileService.findByRelativeUrl(fileEntity.parent, obj.descriptionFile);
      jsonEntity.mappedFile = fileEntity;
      jsonEntity.title = obj.title;
      this.activityCollectionService.addOrUpdate(jsonEntity);
    }
  }

  async handleChange(event: StorageChangeEvent) {
    switch (true) {
      case event instanceof FileAddedEvent:
        await this.handleFileAdded(event);
        break;
      default:
    }
  }
}
