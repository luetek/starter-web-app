import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { randomUUID } from 'crypto';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';
import { ScheduleModule } from '@nestjs/schedule';
import { MulterModule } from '@nestjs/platform-express';
import multer from 'multer';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from '../logger/logger.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { UserModule } from '../users/user.module';
import { AppConfigModule } from '../app-config/app-config.module';
import { StoragePathModule } from '../storage-path/storage-path.module';
import { ActivityModule } from '../activity/activity.module';
import { ProgramExecuterModule } from '../program-executer/program-executer.module';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request) => req.headers['X-Request-Id'] ?? randomUUID(),
      },
    }),
    GoogleRecaptchaModule.forRoot({
      secretKey: '53534-546546',
      response: (req) => req.headers.recaptcha,
      skipIf: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => {
        return {
          type: 'sqlite',
          autoLoadEntities: true,
          synchronize: true,
          database: 'test.db',
          logging: ['error'],
        };
      },
      inject: [],
    }),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    MulterModule.registerAsync({
      useFactory: () => {
        return {
          storage: multer.memoryStorage(),
          limits: {
            fileSize: 10 * 1024 * 1024, // 10 MB max size
            files: 10, // One file max
          },
        };
      },
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    LoggerModule,
    AppConfigModule,
    UserModule,
    StoragePathModule,
    ActivityModule,
    ProgramExecuterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
