import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { FolderScanCronService } from './folder-scan.cron';
import { LoggerModule } from '../logger/logger.module';
import { AppConfigModule } from '../app-config/app-config.module';
import { StoragePathEntity } from './entities/storage-path.entity';
import { StorageV2Controller } from './storage-path.controller';
import { StoragePathService } from './storage-path.service';

@Module({
  imports: [LoggerModule, AppConfigModule, TypeOrmModule.forFeature([StoragePathEntity])],
  controllers: [StorageV2Controller],
  providers: [StoragePathService],
  exports: [],
})
export class StoragePathModule {}
