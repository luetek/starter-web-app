import { Body, Controller, Get, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ReqLogger } from '../logger/req-logger';
import { ProgramExecuterService } from './program-executer.service';
import { SimpleExecuteRequestDto } from './dtos/simple-execute-request.dto';

@Controller('program-executer')
export class ProgramExecuterController {
  constructor(
    private readonly programExecuterService: ProgramExecuterService,
    private logger: ReqLogger
  ) {
    logger.setContext(ProgramExecuterController.name);
  }

  @Post('simple-execute')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'sources', maxCount: 5 },
      { name: 'inputs', maxCount: 5 },
    ])
  )
  simpleExecute(
    @UploadedFiles() files: { sources?: Express.Multer.File[]; inputs?: Express.Multer.File[] },
    @Body() req: SimpleExecuteRequestDto
  ) {
    this.logger.log(`simple execute called for env = ${req.environment}`);
    this.logger.log(JSON.stringify(files));
    return this.programExecuterService.simpleExecute(files.sources, files.inputs, req.environment, req.mainFile);
  }

  @Get('workspaceName/:workspaceName/files/:fileName')
  streamFile(@Param('workspaceName') workspace: string, @Param('fileName') fileName: string) {
    this.logger.log(`Get Workspace file called with ${workspace} and file = ${fileName}`);
    return this.programExecuterService.streamFile(workspace, fileName);
  }
}
