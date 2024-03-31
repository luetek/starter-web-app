import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ReqLogger } from './req-logger';
import { LoggerInterceptor } from './logger.interceptor';

@Module({
  providers: [
    ReqLogger,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
  exports: [ReqLogger],
})
export class LoggerModule {}
