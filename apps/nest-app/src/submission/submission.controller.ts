import { Body, Controller, Get, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ReqLogger } from '../logger/req-logger';
import { SubmissionService } from './submission.service';
import { ProgrammingActivitySubmissionRequestDto } from './dtos/programming-activity-submission.request.dto';

@Controller('submissions')
export class SubmissionController {
  constructor(
    private readonly submissionService: SubmissionService,
    private logger: ReqLogger
  ) {
    logger.setContext(SubmissionController.name);
  }

  @Post('programming-activity-stdin')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'inputs', maxCount: 5 }]))
  create(
    @UploadedFiles() files: { inputs?: Express.Multer.File[] },
    @Body() req: ProgrammingActivitySubmissionRequestDto
  ) {
    this.logger.log(JSON.stringify(files.inputs));
    this.logger.log(JSON.stringify(req));
    return this.submissionService.create(files.inputs, req);
  }

  @Get()
  getSubmissions(@Query('activityId') activityId: number, @Query('userId') userId: number) {
    return this.submissionService.findByUserAndActivityId(userId, activityId);
  }
}
