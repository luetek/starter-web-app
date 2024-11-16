import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReqLogger } from '../logger/req-logger';
import { CreateCollectionDto } from './dtos/create-collection.dto';
import { StoragePathEntity } from './entities/storage-path.entity';

@Injectable()
export class StoragePathService {
  constructor(
    private logger: ReqLogger,
    @InjectRepository(StoragePathEntity)
    private storagePathRepository: Repository<StoragePathEntity>
  ) {}

  async create(createRequest: CreateCollectionDto) {
    const collection = new StoragePathEntity();
    collection.parent = await this.storagePathRepository.findOne({ where: { id: createRequest.parentId } });
    collection.name = createRequest.name;
    return this.storagePathRepository.save(collection);
  }

  findAll() {
    return this.storagePathRepository.find();
  }
}
