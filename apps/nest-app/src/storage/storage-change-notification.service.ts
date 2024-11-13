import { Injectable } from '@nestjs/common';
import {
  FileAddedEvent,
  FileChangeEvent,
  FileDeletedEvent,
  FileModifiedEvent,
  FileRenameEvent,
  IFile,
  StorageChangeEvent,
  StorageEntityChangeHandler,
} from '@luetek/common-models';
import { Readable } from 'stream';
import { ReqLogger } from '../logger/req-logger';
import { StoragePublicationService } from './storage-publication.service';
import { StorageStreamingService } from './storage-streaming.service';
import { FileService } from './file.service';
import { FileEntity } from './entities/file.entity';

function streamToString(stream: Readable) {
  const chunks = [];
  return new Promise<string>((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

@Injectable()
export class StorageChangeNotificationService {
  handlers: StorageEntityChangeHandler[] = [];

  constructor(
    private storagePublicationService: StoragePublicationService,
    private storageStreamingService: StorageStreamingService,
    private fileService: FileService,
    private logger: ReqLogger
  ) {
    this.logger.setContext(StorageChangeNotificationService.name);
  }

  register(handler: StorageEntityChangeHandler) {
    // if (this.handlers.some((h) => h === handler)) return;
    this.handlers.push(handler);
    this.logger.log(`Handler Added count = ${this.handlers.length}`);
  }

  unregister(handler: StorageEntityChangeHandler) {
    const idx = this.handlers.findIndex((h) => h === handler);
    if (!idx) {
      this.handlers.splice(idx, 1);
    }
  }

  async publish(event: StorageChangeEvent) {
    this.logger.log(`Publishing to ${this.handlers.length} handlers, event =  ${JSON.stringify(event)}`);
    await this.handleChange(event);
  }

  async handleChange(event: StorageChangeEvent) {
    this.logger.log(`File Added Event Handler called ${event.type}`);
    const eventRecieved = event as FileChangeEvent;
    if (!eventRecieved.file) {
      this.logger.error(`Ignoring Folder Event ${event}`);
      return;
    }
    const handlers = this.handlers.filter((handler) => handler.handleFile(eventRecieved.file.name));
    if (handlers.length !== 1) {
      this.logger.error(`One handler expected, found = ${handlers.length}`);
    }
    switch (true) {
      case event instanceof FileAddedEvent:
        await this.handleFileAdded(handlers[0], event.file);
        break;
      case event instanceof FileDeletedEvent:
        await this.handleFileDeleted(handlers[0], event.file);
        break;
      case event instanceof FileModifiedEvent:
        await this.handleFileUpdated(handlers[0], event.file);
        break;
      case event instanceof FileRenameEvent:
        await this.handleFileMoved(handlers[0], event.file, event.old);
        break;
      default:
    }
  }

  async handleFileMoved(handler: StorageEntityChangeHandler, newFile: IFile, oldFile: IFile) {
    throw new Error('Method not implemented.');
  }

  async handleFileUpdated(handler: StorageEntityChangeHandler, efile: IFile) {
    throw new Error('Method not implemented.');
  }

  async handleFileDeleted(handler: StorageEntityChangeHandler, file: IFile) {
    throw new Error('Method not implemented.');
  }

  async handleFileAdded(handler: StorageEntityChangeHandler, file: IFile) {
    const readableStream = await this.storageStreamingService.fetchAsStream(file as FileEntity);
    const jsonData = await streamToString(readableStream);
    await handler.entityAdded(handler.deserialize(jsonData));
  }
}
