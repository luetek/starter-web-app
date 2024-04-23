import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
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
  ],
  exports: ['S3CLIENT'],
})
export class AppConfigModule {}
