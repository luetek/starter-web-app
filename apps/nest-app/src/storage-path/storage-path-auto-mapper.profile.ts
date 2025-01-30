import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper, createMap } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { PaginatedStoragePathDto, StoragePathDto } from '@luetek/common-models';
import { StoragePathEntity } from './entities/storage-path.entity';
import { PaginatedStoragePathEntity } from './entities/storage-path-paginated.entity';

@Injectable()
export class StoragePathAutoMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, StoragePathEntity, StoragePathDto);
      createMap(mapper, PaginatedStoragePathEntity, PaginatedStoragePathDto);
    };
  }
}
