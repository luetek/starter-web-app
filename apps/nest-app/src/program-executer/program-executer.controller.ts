import { Controller, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ReqLogger } from '../logger/req-logger';
import { ProgramExecuterService } from './program-executer.service';

@Controller('program-executer')
export class ProgramExecuterController {
  constructor(
    private readonly programExecuterService: ProgramExecuterService,
    private logger: ReqLogger
  ) {
    logger.setContext(ProgramExecuterController.name);
  }

  @Post('simple-execute/:enviroment')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'sources', maxCount: 5 },
      { name: 'inputs', maxCount: 5 },
    ])
  )
  simpleExecute(
    @UploadedFiles() files: { sources?: Express.Multer.File[]; inputs?: Express.Multer.File[] },
    @Param('enviroment') environment: string
  ) {
    this.logger.log(`simple execute called for env = ${environment}`);
    this.logger.log(JSON.stringify(files));
    return this.programExecuterService.simpleExecute(files.sources, files.inputs, environment);
  }
}
