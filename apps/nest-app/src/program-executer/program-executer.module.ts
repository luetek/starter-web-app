import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import path from 'path';
import fs from 'fs';
import { PROGRAMMING_ACTIVITY_STDIN_SUBMISSION_TYPE } from '@luetek/common-models';
import { LoggerModule } from '../logger/logger.module';
import { AppConfigModule } from '../app-config/app-config.module';
import { StoragePathEntity } from '../storage-path/entities/storage-path.entity';
import { ProgramExecuterController } from './program-executer.controller';
import { ReqLogger } from '../logger/req-logger';
import { ProgramExecuterService } from './program-executer.service';
import { EventService } from '../event/event.service';
import { SubmissionEventProcessor } from './submission-event.processor';
import { EventModule } from '../event/event.module';

@Module({
  imports: [LoggerModule, AppConfigModule, EventModule, TypeOrmModule.forFeature([StoragePathEntity])],
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
      inject: [ProgramExecuterService, EventService, ReqLogger],
      useFactory: async (
        programExecuterService: ProgramExecuterService,
        eventService: EventService,
        logger: ReqLogger
      ) => {
        const service = new SubmissionEventProcessor(programExecuterService, logger);
        eventService.register(service, PROGRAMMING_ACTIVITY_STDIN_SUBMISSION_TYPE);
        return service;
      },
    },
  ],
  exports: [],
})
export class ProgramExecuterModule {}
