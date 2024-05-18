import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FolderType } from '@luetek/common-models';
import { FolderEntity } from './entities/folder.entity';
import { RootFolderEntity } from './entities/root-folder.entity';
import { FileEntity } from './entities/file.entity';
import { StorageService } from './services/storage-service.interface';
import { FileSystemService } from './services/file-system-service';
import { S3Service } from './services/s3-service';
import { ReqLogger } from '../logger/req-logger';

@Injectable()
export class FileService {
  private serviceMap: Map<FolderType, StorageService> = new Map();

  constructor(
    @InjectRepository(FolderEntity)
    private foldersRepository: Repository<FolderEntity>,
    @InjectRepository(RootFolderEntity)
    private rootFoldersRepository: Repository<RootFolderEntity>,
    @InjectRepository(FileEntity)
    private filesRepository: Repository<FileEntity>,
    fileSystemService: FileSystemService,
    s3Service: S3Service,

    private logger: ReqLogger
  ) {
    this.logger.setContext(FileService.name);
    this.serviceMap.set(FolderType.FILE_SYSTEM, fileSystemService);
    this.serviceMap.set(FolderType.S3, s3Service);
  }

  async findByRelativeUrl(parentFolderEntity: FolderEntity, relativeFileUrl): Promise<FileEntity> {
    const service = this.serviceMap.get(parentFolderEntity.root.folderType);
    return service.findByRelativeUrl(parentFolderEntity, relativeFileUrl);
  }
}
