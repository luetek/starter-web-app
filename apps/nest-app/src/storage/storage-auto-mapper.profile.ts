import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper, createMap } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { FileDto, FolderDto, RootFolderDetailReponseDto, RootFolderDto } from '@luetek/common-models';
import { RootFolderDetailReponseEntity } from './dtos/root-folder-detail-response.entity';
import { FileEntity } from './entities/file.entity';
import { FolderEntity } from './entities/folder.entity';
import { RootFolderEntity } from './entities/root-folder.entity';

@Injectable()
export class StorageAutoMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, RootFolderEntity, RootFolderDto);
      createMap(mapper, FolderEntity, FolderDto);
      createMap(mapper, FileEntity, FileDto);
      createMap(mapper, RootFolderDetailReponseEntity, RootFolderDetailReponseDto);
    };
  }
}
