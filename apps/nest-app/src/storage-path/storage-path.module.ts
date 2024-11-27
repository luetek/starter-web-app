import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { FolderScanCronService } from './folder-scan.cron';
import { LoggerModule } from '../logger/logger.module';
import { AppConfigModule } from '../app-config/app-config.module';
import { StoragePathEntity } from './entities/storage-path.entity';
import { StoragePathController } from './storage-path.controller';
import { StoragePathService } from './storage-path.service';
import { StoragePathAutoMapperProfile } from './storage-path-auto-mapper.profile';

@Module({
  imports: [LoggerModule, AppConfigModule, TypeOrmModule.forFeature([StoragePathEntity])],
  controllers: [StoragePathController],
  providers: [StoragePathService, StoragePathAutoMapperProfile],
  exports: [],
})
export class StoragePathModule {}
