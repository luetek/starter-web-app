import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../logger/logger.module';
import { EventEntity } from './entity/event.entity';
import { EventService } from './event.service';

@Module({
  imports: [LoggerModule, TypeOrmModule.forFeature([EventEntity])],
  controllers: [],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
