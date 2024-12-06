import request from 'supertest';
import fs from 'fs';
import { Test } from '@nestjs/testing';
import { text } from 'node:stream/consumers';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ActivityCollectionDto,
  ActivityDto,
  ActivityType,
  CreateActivityCollectionRequestDto,
  CreateActivityRequestDto,
  ReadingActivity,
} from '@luetek/common-models';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { AcceptanceTestAppModule } from '../../test-utils/acceptance-test-app.module';
import { StoragePathEntity } from '../../storage-path/entities/storage-path.entity';
import { ActivityCollectionEntity } from '../entities/activity-collection.entity';
import { FileSystemService } from '../../storage/file-system.service';
import { ActivityJson } from '../json-models/activity.json';
import { ActivityEntity } from '../entities/activity.entity';

describe('Activity Api/Acceptance/E2E Tests', () => {
  let app: INestApplication;
  let rootDir: string;
  let activityCollectionRepository: Repository<ActivityCollectionEntity>;
  let activityRepository: Repository<ActivityEntity>;
  let storagePathRepository: Repository<StoragePathEntity>;
  let fileSystemService: FileSystemService;
  let actCol: ActivityCollectionDto = null;
  let act: ActivityDto = null;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AcceptanceTestAppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    storagePathRepository = app.get<Repository<StoragePathEntity>>(getRepositoryToken(StoragePathEntity));
    activityCollectionRepository = app.get<Repository<ActivityCollectionEntity>>(
      getRepositoryToken(ActivityCollectionEntity)
    );
    activityRepository = app.get<Repository<ActivityEntity>>(getRepositoryToken(ActivityEntity));
    fileSystemService = app.get<FileSystemService>(FileSystemService);
    rootDir = app.get('ROOT_FS_DIR');
    fs.rmSync(rootDir, { recursive: true, force: true });
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await activityRepository.clear();
    await activityCollectionRepository.clear();
    await storagePathRepository.clear();

    // Init data for tests

    // Create a collection
    const req = new CreateActivityCollectionRequestDto();

    req.readableId = 'python-guide';
    req.description = 'Detailed Guide for Python';
    req.title = 'Python Guide';
    req.keywords = ['python'];
    req.authors = ['deepakk87'];
    const res = await request(app.getHttpServer()).post('/activity-collections').send(req).expect(201);
    actCol = res.body as ActivityCollectionDto;
    // Create an activity
    const req2 = new CreateActivityRequestDto();

    req2.readableId = 'introduction';
    req2.description = 'Intro to Python';
    req2.title = 'Introduction';
    req2.keywords = ['introduction', 'history', 'overview'];
    req2.collectionId = actCol.id;
    req2.type = ActivityType.READING_ACTIVITY;
    const activitySpec = new ReadingActivity();

    activitySpec.fileFormat = 'markdown';
    req2.activitySpec = activitySpec;
    req2.orderId = 1;
    req2.sectionId = 1;
    const res2 = await request(app.getHttpServer())
      .post(`/activity-collections/${actCol.id}/activities`)
      .send(instanceToPlain(req2))
      .expect(201);
    act = res2.body as ActivityDto;
  });

  it('POST /activity-collections/:id/activities', async () => {
    const req = new CreateActivityRequestDto();

    req.readableId = 'datatypes';
    req.description = 'Variable and datatypes in Python';
    req.title = 'Datatypes and Variables';
    req.keywords = ['datatypes', 'variables'];
    req.collectionId = actCol.id;
    req.type = ActivityType.READING_ACTIVITY;
    const activitySpec = new ReadingActivity();

    activitySpec.fileFormat = 'markdown';
    req.activitySpec = activitySpec;
    req.orderId = 1;
    req.sectionId = 1;
    const res = await request(app.getHttpServer())
      .post(`/activity-collections/${actCol.id}/activities`)
      .send(instanceToPlain(req))
      .expect(201);
    const activity = res.body as ActivityDto;
    expect(activity.readableId).toBe(req.readableId);
    expect(activity.parent).toBeDefined();
    expect(activity.parent.pathUrl).toBe('/collections/python-guide/activities/datatypes/');
    expect(activity.description).toEqual(req.description);
    expect(activity.title).toEqual(req.title);
    expect(activity.keywords).toEqual(expect.arrayContaining(req.keywords));
    expect(activity.activitySpec.type).toBe(ActivityType.READING_ACTIVITY);

    const resObj = await fileSystemService.fetchAsStream(activity.parent.id, 'activity.json');
    const jsonStr = await text(resObj.stream);

    const actDes = plainToInstance(ActivityJson, JSON.parse(jsonStr));
    expect(actDes.readableId).toBe(req.readableId);
    expect(actDes.description).toEqual(req.description);
    expect(actDes.title).toEqual(req.title);
    expect(actDes.keywords).toEqual(expect.arrayContaining(req.keywords));
  });

  it('GET /activity-collections/:id/activities', async () => {
    const res = await request(app.getHttpServer()).get(`/activity-collections/${actCol.id}/activities`).expect(200);
    const activities = res.body as ActivityDto[];
    expect(activities.length).toBe(2);
    const activity = activities[0];
    expect(activity.readableId).toBe(act.readableId);
    expect(activity.parent).toBeDefined();
    expect(activity.parent.pathUrl).toBe('/collections/python-guide/activities/introduction/');
    expect(activity.description).toEqual(act.description);
    expect(activity.title).toEqual(act.title);
    expect(activity.keywords).toEqual(expect.arrayContaining(act.keywords));
    expect(activity.activitySpec.type).toBe(ActivityType.READING_ACTIVITY);
    expect(activity.type).toBe(ActivityType.READING_ACTIVITY);
  });

  afterAll(async () => {
    await activityRepository.clear();
    await activityCollectionRepository.clear();
    await storagePathRepository.clear();
    await app.close();
  });
});
