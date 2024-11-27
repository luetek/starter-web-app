import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper, createMap } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { StoragePathEntity } from './entities/storage-path.entity';
import { StoragePathDto } from './dtos/storage-path.dto';

@Injectable()
export class StoragePathAutoMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, StoragePathEntity, StoragePathDto);
    };
  }
}
