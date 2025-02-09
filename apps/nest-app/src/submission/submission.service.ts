/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { randomUUID } from 'crypto';
import {
  CreateFolderRequestDto,
  ProgrammingActivitySubmissionWithStdioCheck,
  SubmissionDto,
  SubmissionStatus,
  SubmissionType,
} from '@luetek/common-models';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { FileSystemService } from '../storage/file-system.service';
import { SubmissionEntity } from './entities/submission.entity';
import { ActivityEntity } from '../activity/entities/activity.entity';
import { UserEntity } from '../users/entities/user.entity';
import { EventService } from '../event/event.service';
import { ReqLogger } from '../logger/req-logger';
import { SubmissionEventPayload } from './dtos/submission-event.payload';
import { ProgrammingActivitySubmissionRequestDto } from './dtos/programming-activity-submission.request.dto';

export class SubmissionService {
  constructor(
    private fileSystemService: FileSystemService,
    private eventService: EventService,
    private logger: ReqLogger,
    @InjectRepository(SubmissionEntity)
    private submissionRepository: Repository<SubmissionEntity>,
    @InjectRepository(ActivityEntity)
    private activityRepository: Repository<ActivityEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectMapper() private mapper: Mapper
  ) {
    this.logger.setContext(SubmissionService.name);
  }

  async create(inputs: Express.Multer.File[], req: ProgrammingActivitySubmissionRequestDto) {
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
    submissionEntity.type = SubmissionType.PROGRAMMING_ACTIVITY_STDIO__SUBMISSION;
    const submissionSpec = new ProgrammingActivitySubmissionWithStdioCheck();
    submissionSpec.environment = req.environment;
    submissionSpec.inputSrcMainFile = req.inputSrcMainFile;
    submissionEntity.submissionSpec = submissionSpec;
    const res = await this.submissionRepository.manager.transaction(async (tm) => {
      const subEn = await this.submissionRepository.save(submissionEntity);
      const payload = new SubmissionEventPayload();
      payload.type = subEn.type;
      payload.submissionId = subEn.id;
      await this.eventService.emit(tm, payload);
      return subEn;
    });
    this.logger.log(
      `submission created id = ${res.id} type = ${res.type} activityId = ${res.activityId} userId = ${res.userId}`
    );
    return this.mapper.map(res, SubmissionEntity, SubmissionDto);
  }

  async findByUserAndActivityId(userId: number, activityId: number) {
    const res = await this.submissionRepository.find({ where: { userId, activityId }, relations: ['parent'] });
    return this.mapper.mapArray(res, SubmissionEntity, SubmissionDto);
  }
}
