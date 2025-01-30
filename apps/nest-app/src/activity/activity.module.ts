import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../logger/logger.module';
import { AppConfigModule } from '../app-config/app-config.module';
import { ActivityEntity } from './entities/activity.entity';
import { ActivityCollectionEntity } from './entities/activity-collection.entity';
import { ActivityCollectionController } from './activity-collection.controller';
import { ActivityCollectionService } from './services/activity-collection-service';
import { ActivityCollectionSubscriber } from './subscriber/post-collection.subscriber';
import { StorageModule } from '../storage/storage.module';
import { StoragePathEntity } from '../storage-path/entities/storage-path.entity';
import { ActivityCollectionAutoMapperProfile } from './activity-collection-auto-mapper.profile';
import { ActivityService } from './services/activity.service';
import { ActivitySubscriber } from './subscriber/activity.subscriber';

@Module({
  imports: [
    LoggerModule,
    AppConfigModule,
    StorageModule,
    TypeOrmModule.forFeature([ActivityEntity, ActivityCollectionEntity, StoragePathEntity]),
  ],
  controllers: [ActivityCollectionController],
  providers: [
    ActivityCollectionService,
    ActivityService,
    ActivityCollectionSubscriber,
    ActivitySubscriber,
    ActivityCollectionAutoMapperProfile,
  ],
  exports: [],
})
export class ActivityModule {}
