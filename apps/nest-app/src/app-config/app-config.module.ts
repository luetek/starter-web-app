import path from 'path';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';
import os from 'os';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [LoggerModule],
  providers: [
    {
      provide: 'S3CLIENT',
      useFactory: async (configService: ConfigService) => {
        if (!configService.get('AWS_ACCESS_KEY_ID')) {
          return null;
        }
        const accessKeyId = configService.getOrThrow('AWS_ACCESS_KEY_ID');
        const secretAccessKey = configService.getOrThrow('AWS_SECRET_ACCESS_KEY');
        const region = configService.getOrThrow('AWS_DEFAULT_REGION');

        return new S3Client({ credentials: { accessKeyId, secretAccessKey }, region });
      },
      inject: [ConfigService],
    },
    {
      provide: 'ROOT_FS_DIR',
      useFactory: async (configService: ConfigService) => {
        if (!configService.get('ROOT_FS_DIR')) {
          return process.cwd();
        }
        const rootDir = configService.get('ROOT_FS_DIR');
        return path.isAbsolute(rootDir) ? rootDir : path.join(process.cwd(), rootDir);
      },
      inject: [ConfigService],
    },
    {
      provide: 'ROOT_TEMP_DIR',
      useFactory: async (configService: ConfigService) => {
        const appPrefix = configService.getOrThrow('APP_NAME');
        return fs.mkdtempSync(path.join(os.tmpdir(), appPrefix));
      },
      inject: [ConfigService],
    },
  ],
  exports: ['S3CLIENT', 'ROOT_FS_DIR', 'ROOT_TEMP_DIR'],
})
export class AppConfigModule {}
