import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../logger/logger.module';
import { SubmissionEntity } from './entities/submission.entity';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';
import { SubmissionAutoMapperProfile } from './submission-auto-mapper.profile';
import { StorageModule } from '../storage/storage.module';
import { ActivityEntity } from '../activity/entities/activity.entity';
import { UserEntity } from '../users/entities/user.entity';
import { EventModule } from '../event/event.module';

@Module({
  imports: [
    LoggerModule,
    StorageModule,
    EventModule,
    TypeOrmModule.forFeature([SubmissionEntity, ActivityEntity, UserEntity]),
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService, SubmissionAutoMapperProfile],
  exports: [],
})
export class SubmissionModule {}
