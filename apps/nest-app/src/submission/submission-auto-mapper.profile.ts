import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper, createMap } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { StoragePathDto, SubmissionDto } from '@luetek/common-models';
import { SubmissionEntity } from './entities/submission.entity';
import { StoragePathEntity } from '../storage-path/entities/storage-path.entity';

@Injectable()
export class SubmissionAutoMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, SubmissionEntity, SubmissionDto);
      createMap(mapper, StoragePathEntity, StoragePathDto);
    };
  }
}
