import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { CreateFolderRequestDto, PaginatedStoragePathDto, StoragePathDto, StorageType } from '@luetek/common-models';
import { InjectMapper } from '@automapper/nestjs';
import { FilterOperator, FilterSuffix, paginate, PaginateQuery } from 'nestjs-paginate';
import { Mapper } from '@automapper/core';
import { ReqLogger } from '../logger/req-logger';
import { StoragePathEntity } from './entities/storage-path.entity';
import { PaginatedStoragePathEntity } from './entities/storage-path-paginated.entity';

@Injectable()
export class StoragePathService {
  private storagePathTreeRepository: TreeRepository<StoragePathEntity>;

  constructor(
    private logger: ReqLogger,
    @InjectMapper() private mapper: Mapper,
    @InjectRepository(StoragePathEntity)
    private storagePathRepository: Repository<StoragePathEntity>
  ) {
    this.storagePathTreeRepository = storagePathRepository.manager.getTreeRepository(StoragePathEntity);
  }

  // TODO:: Authorization needed
  async createFolder(createRequest: CreateFolderRequestDto) {
    const folderEntity = new StoragePathEntity();
    folderEntity.parent = await this.storagePathRepository.findOne({ where: { id: createRequest.parentId } });
    folderEntity.name = createRequest.name;
    folderEntity.storageType = StorageType.FOLDER;
    return this.storagePathRepository.save(folderEntity);
  }

  async findAll(query: PaginateQuery): Promise<PaginatedStoragePathDto> {
    const paginatedData = await paginate(query, this.storagePathRepository, {
      sortableColumns: ['name', 'pathUrl'],
      nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['name', 'pathUrl'],
      relations: [],
      select: [],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterSuffix.NOT, FilterOperator.ILIKE],
        pathUrl: [FilterOperator.EQ, FilterSuffix.NOT, FilterOperator.ILIKE],
        parentId: [FilterOperator.EQ, FilterSuffix.NOT, FilterOperator.ILIKE, FilterOperator.NULL],
      },
    });

    return this.mapper.map(paginatedData, PaginatedStoragePathEntity, PaginatedStoragePathDto);
  }

  async findDetails(id: number): Promise<StoragePathDto> {
    const en = await this.storagePathRepository.findOne({ where: { id } });
    const resEn = await this.storagePathTreeRepository.findDescendantsTree(en);
    return this.mapper.map(resEn, StoragePathEntity, StoragePathDto);
  }
}
