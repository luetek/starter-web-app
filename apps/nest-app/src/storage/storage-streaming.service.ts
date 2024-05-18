import { Injectable } from '@nestjs/common';
import { FolderType } from '@luetek/common-models';
import { Readable } from 'readable-stream';
import { ReqLogger } from '../logger/req-logger';
import { StorageService } from './services/storage-service.interface';
import { FileSystemService } from './services/file-system-service';
import { S3Service } from './services/s3-service';
import { FileEntity } from './entities/file.entity';

@Injectable()
export class StorageStreamingService {
  private serviceMap: Map<FolderType, StorageService> = new Map();

  constructor(
    fileSystemService: FileSystemService,
    s3Service: S3Service,
    private logger: ReqLogger
  ) {
    this.logger.setContext(StorageStreamingService.name);
    this.serviceMap.set(FolderType.FILE_SYSTEM, fileSystemService);
    this.serviceMap.set(FolderType.S3, s3Service);
  }

  async fetchAsStream(file: FileEntity): Promise<Readable> {
    const service = this.serviceMap.get(file.root.folderType);
    return service.fetchAsStream(file);
  }
}
