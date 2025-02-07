/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { randomUUID } from 'crypto';
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

export class SubmissionService {
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

  async findByUserAndActivityId(userId: number, activityId: number) {
    const res = await this.submissionRepository.find({ where: { userId, activityId }, relations: ['parent'] });
    return this.mapper.mapArray(res, SubmissionEntity, SubmissionDto);
  }
}
