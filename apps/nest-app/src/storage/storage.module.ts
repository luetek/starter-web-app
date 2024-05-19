import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FolderService } from './folder.service';
import { FolderController } from './folder.controller';
import { FolderEntity } from './entities/folder.entity';
import { FileEntity } from './entities/file.entity';
// import { FolderScanCronService } from './folder-scan.cron';
import { LoggerModule } from '../logger/logger.module';
import { AppConfigModule } from '../app-config/app-config.module';
import { RootFolderEntity } from './entities/root-folder.entity';
import { FileSystemService } from './services/file-system-service';
import { S3Service } from './services/s3-service';
import { StorageAutoMapperProfile } from './storage-auto-mapper.profile';
import { StoragePublicationService } from './storage-publication.service';
import { StorageStreamingService } from './storage-streaming.service';
import { FileService } from './file.service';

@Module({
  imports: [LoggerModule, AppConfigModule, TypeOrmModule.forFeature([FolderEntity, FileEntity, RootFolderEntity])],
  controllers: [FolderController],
  providers: [
    FolderService,
    FileService,
    S3Service,
    FileSystemService,
    StorageAutoMapperProfile,
    StoragePublicationService,
    StorageStreamingService,
  ],
  exports: [FolderService, FileService, StoragePublicationService, StorageStreamingService],
})
export class StorageModule {}
