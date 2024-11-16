/* eslint-disable import/no-extraneous-dependencies */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { ClsModule } from 'nestjs-cls';
import { randomUUID } from 'crypto';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';
import { LoggerModule } from '../logger/logger.module';
import { UserModule } from '../users/user.module';
import { StoragePathModule } from '../storage-path/storage-path.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    LoggerModule,
    GoogleRecaptchaModule.forRoot({
      secretKey: '53534-546546',
      response: (req) => req.headers.recaptcha,
      skipIf: true,
    }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request) => req.headers['X-Request-Id'] ?? randomUUID(),
      },
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
          // database: ':memory:',
          database: 'unit-test.db',
          logging: ['error'],
        };
      },
      inject: [],
    }),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    // Project specific modules
    UserModule,
    StoragePathModule,
    StorageModule,
  ],
  controllers: [],
  providers: [],
})
export class AcceptanceTestAppModule {}
