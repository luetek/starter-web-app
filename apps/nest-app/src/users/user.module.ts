import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { UserPasswordEntity } from './entities/user-password.entity';
import { UserController } from './user.controller';
import { UserAutoMapperProfile } from './user-auto-mapper.profile';

@Module({
  imports: [LoggerModule, TypeOrmModule.forFeature([UserEntity, UserPasswordEntity])],
  controllers: [UserController],
  providers: [UserService, UserAutoMapperProfile],
  exports: [UserService],
})
export class UserModule {}