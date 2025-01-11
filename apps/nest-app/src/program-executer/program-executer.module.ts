import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import path from 'path';
import fs from 'fs';
import { LoggerModule } from '../logger/logger.module';
import { AppConfigModule } from '../app-config/app-config.module';
import { StoragePathEntity } from '../storage-path/entities/storage-path.entity';
import { ProgramExecuterController } from './program-executer.controller';

import { ReqLogger } from '../logger/req-logger';
import { ProgramExecuterService } from './program-executer.service';

@Module({
  imports: [LoggerModule, AppConfigModule, TypeOrmModule.forFeature([StoragePathEntity])],
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
  ],
  exports: [],
})
export class ProgramExecuterModule {}
