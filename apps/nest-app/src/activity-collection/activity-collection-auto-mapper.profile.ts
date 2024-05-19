import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper, createMap } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { ActivityCollectionDto, FileDto, FolderDto } from '@luetek/common-models';
import { ActivityCollectionJsonEntity } from './json-entities/activity-collection.entity';
import { FolderEntity } from '../storage/entities/folder.entity';
import { FileEntity } from '../storage/entities/file.entity';

@Injectable()
export class ActivityCollectionAutoMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, FolderEntity, FolderDto);
      createMap(mapper, FileEntity, FileDto);
      createMap(mapper, ActivityCollectionJsonEntity, ActivityCollectionDto);
    };
  }
}
