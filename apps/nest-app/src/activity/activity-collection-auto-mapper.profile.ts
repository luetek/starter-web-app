import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper, createMap } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { ActivityCollectionDto } from '@luetek/common-models';
import { ActivityCollectionEntity } from './entities/activity-collection.entity';
import { ActivityCollectionJson } from './json-models/activity-collection.json';

@Injectable()
export class ActivityCollectionAutoMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, ActivityCollectionEntity, ActivityCollectionJson);
      createMap(mapper, ActivityCollectionEntity, ActivityCollectionDto);
    };
  }
}
