import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper, createMap } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { ActivityCollectionDto, ActivityDto } from '@luetek/common-models';
import { ActivityCollectionEntity } from './entities/activity-collection.entity';
import { ActivityCollectionJson } from './json-models/activity-collection.json';
import { ActivityEntity } from './entities/activity.entity';
import { ActivityJson } from './json-models/activity.json';

@Injectable()
export class ActivityCollectionAutoMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, ActivityCollectionEntity, ActivityCollectionJson);
      createMap(mapper, ActivityCollectionEntity, ActivityCollectionDto);
      createMap(mapper, ActivityEntity, ActivityDto);
      createMap(mapper, ActivityEntity, ActivityJson);
    };
  }
}
