import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../logger/logger.module';
import { AppConfigModule } from '../app-config/app-config.module';
import { StoragePathEntity } from '../storage-path/entities/storage-path.entity';
import { FileSystemController } from './file-system.controller';
import { FileSystemService } from './file-system.service';

@Module({
  imports: [LoggerModule, AppConfigModule, TypeOrmModule.forFeature([StoragePathEntity])],
  controllers: [FileSystemController],
  providers: [FileSystemService],
  exports: [],
})
export class StorageModule {}
