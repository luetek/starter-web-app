import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { FolderScanCronService } from './folder-scan.cron';
import { LoggerModule } from '../logger/logger.module';
import { AppConfigModule } from '../app-config/app-config.module';
import { ActivityEntity } from './entities/activity.entity';
import { ActivityCollectionEntity } from './entities/activity-collection.entity';

@Module({
  imports: [LoggerModule, AppConfigModule, TypeOrmModule.forFeature([ActivityEntity, ActivityCollectionEntity])],
  controllers: [],
  providers: [],
  exports: [],
})
export class ActivityModule {}
