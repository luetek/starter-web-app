import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { ActivityCollectionController } from './activity-collection.controller';
import { ActivityCollectionService } from './activity-collection-service';
import { LoggerModule } from '../logger/logger.module';

@Module({
  providers: [ActivityCollectionService],
  imports: [StorageModule, LoggerModule],
  controllers: [ActivityCollectionController],
})
export class ActivityCollectionModule {}
