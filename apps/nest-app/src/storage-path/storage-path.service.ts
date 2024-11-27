import { Injectable, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedStoragePathDto, StorageType } from '@luetek/common-models';
import { MapInterceptor } from '@automapper/nestjs';
import { FilterOperator, FilterSuffix, paginate, PaginateQuery } from 'nestjs-paginate';
import { ReqLogger } from '../logger/req-logger';
import { CreateFolderRequestDto } from './dtos/create-folder-request.dto';
import { StoragePathEntity } from './entities/storage-path.entity';
import { PaginatedStoragePathEntity } from './entities/storage-path-paginated.entity';

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

  @UseInterceptors(MapInterceptor(PaginatedStoragePathEntity, PaginatedStoragePathDto))
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

    return paginatedData;
  }
}
