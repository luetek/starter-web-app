import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper, createMap } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { UserAccessTokenDto, UserDto, UserPasswordDto } from '@luetek/common-models';
import { UserEntity } from './entities/user.entity';
import { UserPasswordEntity } from './entities/user-password.entity';
import { UserAccessTokenEntity } from './entities/user-access-token.entity';

@Injectable()
export class UserAutoMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, UserEntity, UserDto);
      createMap(mapper, UserPasswordEntity, UserPasswordDto);
      createMap(mapper, UserAccessTokenEntity, UserAccessTokenDto);
    };
  }
}
