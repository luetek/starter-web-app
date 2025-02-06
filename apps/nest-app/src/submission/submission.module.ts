import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../logger/logger.module';
import { SubmissionEntity } from './entities/submission.entity';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';

@Module({
  imports: [LoggerModule, TypeOrmModule.forFeature([SubmissionEntity])],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [],
})
export class SubmissionModule {}
