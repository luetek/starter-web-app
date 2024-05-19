import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { ActivityCollectionController } from './activity-collection.controller';
import { ActivityCollectionService } from './activity-collection-service';
import { LoggerModule } from '../logger/logger.module';
import { ActivityCollectionAutoMapperProfile } from './activity-collection-auto-mapper.profile';
import { ActivityCollectionListernerFsListener } from './activity-collection-fs-listener';

@Module({
  providers: [ActivityCollectionService, ActivityCollectionAutoMapperProfile, ActivityCollectionListernerFsListener],
  imports: [StorageModule, LoggerModule],
  controllers: [ActivityCollectionController],
})
export class ActivityCollectionModule {}
