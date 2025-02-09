import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import path from 'path';
import fs from 'fs';
import { Repository } from 'typeorm';
import { SubmissionType } from '@luetek/common-models';
import { LoggerModule } from '../logger/logger.module';
import { AppConfigModule } from '../app-config/app-config.module';
import { StoragePathEntity } from '../storage-path/entities/storage-path.entity';
import { ProgramExecuterController } from './program-executer.controller';
import { ReqLogger } from '../logger/req-logger';
import { ProgramExecuterService } from './program-executer.service';
import { EventService } from '../event/event.service';
import { SubmissionEventProcessor } from './submission-event.processor';
import { EventModule } from '../event/event.module';
import { SubmissionEntity } from '../submission/entities/submission.entity';
import { StorageModule } from '../storage/storage.module';
import { FileSystemService } from '../storage/file-system.service';

@Module({
  imports: [
    LoggerModule,
    AppConfigModule,
    EventModule,
    StorageModule,
    TypeOrmModule.forFeature([StoragePathEntity, SubmissionEntity]),
  ],
  controllers: [ProgramExecuterController],
  providers: [
    {
      provide: ProgramExecuterService,
      useFactory: async (rootTempDir: string, logger: ReqLogger) => {
        const executionDirectory = path.join(rootTempDir, 'code-workspaces');
        await fs.promises.mkdir(executionDirectory);
        logger.log(`Execution Directory ${executionDirectory}`);
        return new ProgramExecuterService(executionDirectory);
      },
      inject: ['ROOT_TEMP_DIR', ReqLogger],
    },
    {
      provide: SubmissionEventProcessor,
      inject: [
        ProgramExecuterService,
        EventService,
        FileSystemService,
        ReqLogger,
        getRepositoryToken(SubmissionEntity),
      ],
      useFactory: async (
        programExecuterService: ProgramExecuterService,
        eventService: EventService,
        fileSystemService: FileSystemService,
        logger: ReqLogger,
        submissionRepository: Repository<SubmissionEntity>
      ) => {
        const service = new SubmissionEventProcessor(
          programExecuterService,
          fileSystemService,
          submissionRepository,
          logger
        );
        eventService.register(service, SubmissionType.PROGRAMMING_ACTIVITY_STDIO__SUBMISSION);
        return service;
      },
    },
  ],
  exports: [],
})
export class ProgramExecuterModule {}
