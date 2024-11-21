import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageType } from '@luetek/common-models';
import { ReqLogger } from '../logger/req-logger';
import { CreateFolderRequestDto } from './dtos/create-folder-request.dto';
import { StoragePathEntity } from './entities/storage-path.entity';

@Injectable()
export class StoragePathService {
  constructor(
    private logger: ReqLogger,
    @InjectRepository(StoragePathEntity)
    private storagePathRepository: Repository<StoragePathEntity>
  ) {}

  // TODO:: Authorization needed
  async createFolder(createRequest: CreateFolderRequestDto) {
    const folderEntity = new StoragePathEntity();
    folderEntity.parent = await this.storagePathRepository.findOne({ where: { id: createRequest.parentId } });
    folderEntity.name = createRequest.name;
    folderEntity.storageType = StorageType.FOLDER;
    return this.storagePathRepository.save(folderEntity);
  }

  findAll() {
    return this.storagePathRepository.find();
  }
}
