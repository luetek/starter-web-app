/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { randomUUID } from 'crypto';
import util from 'util';
import { exec } from 'child_process';
import { CreateFolderRequestDto, SubmissionDto, SubmissionStatus } from '@luetek/common-models';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { SubmissionRequestDto } from './dtos/submission.request.dto';
import { FileSystemService } from '../storage/file-system.service';
import { SubmissionEntity } from './entities/submission.entity';
import { ActivityEntity } from '../activity/entities/activity.entity';
import { UserEntity } from '../users/entities/user.entity';

const execute = util.promisify(exec);

function writeToFile(readStream: Readable, filePath: string) {
  const writeStream = fs.createWriteStream(filePath);
  return new Promise<void>((resolve, reject) => {
    readStream
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .pipe(writeStream);
  });
}

/**
 * TODO:: We want to do this async. We submit a task. then the task eventually get picked up.
 * and the response is updated and stored in task. After a given time is elapsed the data is deleted.
 *
 * This will ensure low latency for the api. The drawback is you have to poll for the status and response.
 */

export class SubmissionService {
  private tmpWorkspacesParentDir: string = null;

  constructor(
    private fileSystemService: FileSystemService,
    @InjectRepository(SubmissionEntity)
    private submissionRepository: Repository<SubmissionEntity>,
    @InjectRepository(ActivityEntity)
    private activityRepository: Repository<ActivityEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectMapper() private mapper: Mapper
  ) {
    // console.log(this.tmpWorkspacesParentDir);
  }

  async create(inputs: Express.Multer.File[], req: SubmissionRequestDto) {
    const collectionFolder = await this.fileSystemService.createRootDirectory('submissions');
    const createFolderRequest = new CreateFolderRequestDto();
    createFolderRequest.name = randomUUID();
    createFolderRequest.parentId = collectionFolder.id;
    const submissionFolder = await this.fileSystemService.createDirectory(createFolderRequest);
    await Promise.all(inputs.map((inp) => this.fileSystemService.upload(inp, submissionFolder.id)));
    const submissionEntity = new SubmissionEntity();
    submissionEntity.activity = await this.activityRepository.findOneByOrFail({ id: req.activityId });
    submissionEntity.parentId = submissionFolder.id;
    submissionEntity.user = await this.userRepository.findOneByOrFail({ id: req.userId });
    submissionEntity.status = SubmissionStatus.CREATED;
    const res = await this.submissionRepository.save(submissionEntity);
    return this.mapper.map(res, SubmissionEntity, SubmissionDto);
  }
}
