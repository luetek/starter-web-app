import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRootFolderRequestDto, FolderStatus, FolderType } from '@luetek/common-models';
import { FolderEntity } from './entities/folder.entity';
import { ReqLogger } from '../logger/req-logger';
import { FileSystemService } from './services/file-system-service';
import { S3Service } from './services/s3-service';
import { StorageService } from './services/storage-service.interface';
import { RootFolderEntity } from './entities/root-folder.entity';
import { FileEntity } from './entities/file.entity';
import { StoragePublicationService } from './storage-publication.service';
import { RootFolderDetailReponseEntity } from './dtos/root-folder-detail-response.entity';

@Injectable()
export class FolderService {
  private serviceMap: Map<FolderType, StorageService> = new Map();

  constructor(
    @InjectRepository(FolderEntity)
    private foldersRepository: Repository<FolderEntity>,
    @InjectRepository(RootFolderEntity)
    private rootFoldersRepository: Repository<RootFolderEntity>,
    @InjectRepository(FileEntity)
    private filesRepository: Repository<FileEntity>,
    private storagePulicationService: StoragePublicationService,
    fileSystemService: FileSystemService,
    s3Service: S3Service,

    private logger: ReqLogger
  ) {
    this.logger.setContext(FolderService.name);
    this.serviceMap.set(FolderType.FILE_SYSTEM, fileSystemService);
    this.serviceMap.set(FolderType.S3, s3Service);
  }

  async findAll() {
    this.logger.log('findAll called');
    const items = await this.rootFoldersRepository.find();
    this.logger.log(JSON.stringify(items));
    return items;
  }

  async findOne(rootId: number) {
    const folders = await this.foldersRepository.find({ where: { rootId } });
    const files = await this.filesRepository.find({ where: { rootId } });
    const res = new RootFolderDetailReponseEntity();
    res.files = files;
    res.folders = folders;
    return res;
  }

  async create(createRequest: CreateRootFolderRequestDto) {
    const storageService = this.serviceMap.get(createRequest.folderType);
    const rootFolderEntity = await storageService.createRootFolderEntity(createRequest);
    return this.rootFoldersRepository.save(rootFolderEntity);
  }

  async scan(id: number) {
    // TODO:: What to do if folders and files are already there.
    // and what if some of them are deleted/renamed etc.
    // We can read all the exisitng files and folder and pass it to the storage service.
    const rootFolder = await this.rootFoldersRepository.findOne({ where: { id } });
    if (!rootFolder.readOnly) throw new Error('Folder is not readOnly');
    const foldersExisting = await this.foldersRepository.find({ where: { root: rootFolder } });
    const filesExisting = await this.filesRepository.find({ where: { root: rootFolder } });

    this.logger.log(JSON.stringify(rootFolder));
    const storageService = this.serviceMap.get(rootFolder.folderType);
    const items = await storageService.scan(rootFolder, foldersExisting, filesExisting);

    const folders = await this.foldersRepository.save(
      items.outFolders.filter((folder) => folder.status !== FolderStatus.DELETED)
    );
    const files = await this.filesRepository.save(items.outFiles);
    const foldersToBeDelted = items.outFolders.filter((folder) => folder.status === FolderStatus.DELETED);
    if (foldersToBeDelted.length > 0) await this.foldersRepository.delete(foldersToBeDelted);
    // Publish the events
    items.changeEvents.forEach((event) => {
      this.storagePulicationService.publish(event);
    });
    const res = new RootFolderDetailReponseEntity();
    res.files = files;
    res.folders = folders;
    return res;
  }
}
