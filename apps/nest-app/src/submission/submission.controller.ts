import { Body, Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ReqLogger } from '../logger/req-logger';
import { SubmissionRequestDto } from './dtos/submission.request.dto';
import { SubmissionService } from './submission.service';

@Controller('submissions')
export class SubmissionController {
  constructor(
    private readonly submissionService: SubmissionService,
    private logger: ReqLogger
  ) {
    logger.setContext(SubmissionController.name);
  }

  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'inputs', maxCount: 5 }]))
  create(@UploadedFiles() files: { inputs?: Express.Multer.File[] }, @Body() req: SubmissionRequestDto) {
    this.logger.log(JSON.stringify(files.inputs));
    this.logger.log(JSON.stringify(req));
    return this.submissionService.create(files.inputs, req);
  }
}
