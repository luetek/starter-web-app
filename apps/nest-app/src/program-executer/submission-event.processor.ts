import { Repository } from 'typeorm';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import {
  ProgrammingActivitySubmissionWithStdioCheck,
  ProgrammingActivityWithStdioCheck,
  ProgrammingOutputCompareTestResult,
  SubmissionStatus,
} from '@luetek/common-models';
import { EventProcessor } from '../event/event-processor';
import { ReqLogger } from '../logger/req-logger';
import { SubmissionEventPayload } from '../submission/dtos/submission-event.payload';
import { SubmissionEntity } from '../submission/entities/submission.entity';
import { ProgramExecuterService } from './program-executer.service';
import { FileSystemService } from '../storage/file-system.service';
import { StoragePathEntity } from '../storage-path/entities/storage-path.entity';

function writeToFile(readStream: Readable, filePath: string) {
  const writeStream = fs.createWriteStream(filePath);
  return new Promise<void>((resolve, reject) => {
    readStream
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .pipe(writeStream);
  });
}

export class SubmissionEventProcessor implements EventProcessor {
  constructor(
    private programExecuterService: ProgramExecuterService,
    private fileSystemService: FileSystemService,
    private submissionRepository: Repository<SubmissionEntity>,
    private logger: ReqLogger
  ) {
    logger.setContext(`${SubmissionEventProcessor.name} Prg`);
  }

  private async copyFolderToTmpWorkspace(tmpWorkspaceDir: string, folder: StoragePathEntity) {
    const files = folder.children;
    await Promise.all(
      files.map(async (file) => {
        const streamFile = await this.fileSystemService.fetchFileAsStream(file);
        await writeToFile(streamFile.stream, path.join(tmpWorkspaceDir, streamFile.name));
      })
    );
  }

  async process(payload: SubmissionEventPayload) {
    this.logger.log('Starting submission processing');
    const submissionEntity = await this.submissionRepository.findOneOrFail({
      where: { id: payload.submissionId },
      relations: ['parent', 'parent.children', 'activity', 'activity.parent', 'activity.parent.children'],
    });

    const tmpWorkspaceDir = await this.programExecuterService.createTmpWorkspace();
    await this.copyFolderToTmpWorkspace(tmpWorkspaceDir, submissionEntity.parent);
    await this.copyFolderToTmpWorkspace(tmpWorkspaceDir, submissionEntity.activity.parent);
    this.logger.log('copying files to rmp workspce done');
    const programmingActivity = submissionEntity.activity.activitySpec as ProgrammingActivityWithStdioCheck;
    const programmingActivitySubmissionSpec =
      submissionEntity.submissionSpec as ProgrammingActivitySubmissionWithStdioCheck;
    this.logger.log(`submsion spec =  ${JSON.stringify(programmingActivitySubmissionSpec)}`);
    const userResult = await this.programExecuterService.execute(
      tmpWorkspaceDir,
      programmingActivitySubmissionSpec.inputSrcMainFile,
      programmingActivity.testInputFiles,
      programmingActivitySubmissionSpec.environment
    );
    const userResultFiles = await Promise.all(
      userResult.outputs.map(async (output) => {
        if (output.returnCode === 0) {
          const stream = fs.createReadStream(path.join(tmpWorkspaceDir, output.outputFile));
          return this.fileSystemService.uploadStream(stream, submissionEntity.parent, output.outputFile);
        }
        const stream = fs.createReadStream(path.join(tmpWorkspaceDir, output.errorFile));
        return this.fileSystemService.uploadStream(stream, submissionEntity.parent, output.errorFile);
      })
    );
    this.logger.log(`Processing userResult done ${JSON.stringify(userResult)}`);

    const testResult = await this.programExecuterService.execute(
      tmpWorkspaceDir,
      programmingActivity.inputSrcMainFile,
      programmingActivity.testInputFiles,
      'PYTHON3'
    );
    const testResultFiles = await Promise.all(
      testResult.outputs.map(async (output) => {
        if (output.returnCode === 0) {
          const stream = fs.createReadStream(path.join(tmpWorkspaceDir, output.outputFile));
          return this.fileSystemService.uploadStream(stream, submissionEntity.parent, output.outputFile);
        }
        throw new Error('test program has thrown error');
      })
    );
    this.logger.log(`Processing testResult done ${JSON.stringify(testResult)}`);
    const submissionResults = await Promise.all(
      testResultFiles.map(async (testResultFile, index) => {
        const { inputFile, returnCode, errorFile, outputFile } = userResult.outputs[index];
        const userResultFile = userResultFiles[index];
        const passed = returnCode === 0 && (await this.fileSystemService.areEqual(testResultFile, userResultFile));
        return {
          inputFile,
          passed,
          returnCode,
          errorFile,
          userOutputFile: outputFile,
          testOutputFile: testResultFile.name,
        } as ProgrammingOutputCompareTestResult;
      })
    );
    const accepted = submissionResults.every((item) => item.passed === true);
    submissionEntity.status = SubmissionStatus.DONE;
    programmingActivitySubmissionSpec.accepted = accepted;
    programmingActivitySubmissionSpec.results = submissionResults;
    submissionEntity.submissionSpec = programmingActivitySubmissionSpec;
    this.logger.log(JSON.stringify(programmingActivitySubmissionSpec));
    await this.submissionRepository.save(submissionEntity);
    this.logger.log(`done ${JSON.stringify(payload)}`);
  }
}
