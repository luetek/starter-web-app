import request from 'supertest';
import fs from 'fs';
import { Test } from '@nestjs/testing';
import { text } from 'node:stream/consumers';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityCollectionDto, CreateActivityCollectionRequestDto } from '@luetek/common-models';
import { plainToInstance } from 'class-transformer';
import { AcceptanceTestAppModule } from '../../test-utils/acceptance-test-app.module';
import { StoragePathEntity } from '../../storage-path/entities/storage-path.entity';
import { ActivityCollectionEntity } from '../entities/activity-collection.entity';
import { FileSystemService } from '../../storage/file-system.service';
import { ActivityCollectionJson } from '../json-models/activity-collection.json';

describe('Activity Collection Api/Acceptance/E2E Tests', () => {
  let app: INestApplication;
  let rootDir: string;
  let activityCollectionRepository: Repository<ActivityCollectionEntity>;
  let storagePathRepository: Repository<StoragePathEntity>;
  let fileSystemService: FileSystemService;
  let actCol: ActivityCollectionDto = null;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AcceptanceTestAppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    storagePathRepository = app.get<Repository<StoragePathEntity>>(getRepositoryToken(StoragePathEntity));
    activityCollectionRepository = app.get<Repository<ActivityCollectionEntity>>(
      getRepositoryToken(ActivityCollectionEntity)
    );
    fileSystemService = app.get<FileSystemService>(FileSystemService);
    rootDir = app.get('ROOT_FS_DIR');
    fs.rmSync(rootDir, { recursive: true, force: true });
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await activityCollectionRepository.clear();
    await storagePathRepository.clear();

    // Init data for tests

    const req = new CreateActivityCollectionRequestDto();

    req.readableId = 'python-guide';
    req.description = 'Detailed Guide for Python';
    req.title = 'Python Guide';
    req.keywords = ['python'];
    req.authors = ['deepakk87'];
    const res = await request(app.getHttpServer()).post('/activity-collections').send(req).expect(201);
    actCol = res.body as ActivityCollectionDto;
  });

  it('POST /activity-collections', async () => {
    const req = new CreateActivityCollectionRequestDto();

    req.readableId = 'javascript-guide';
    req.description = 'Detailed Guide for Javascript';
    req.title = 'Javascript Guide';
    req.keywords = ['javascript', 'es5', 'es6'];
    req.authors = ['deepakk87'];
    const res = await request(app.getHttpServer()).post('/activity-collections').send(req).expect(201);
    const activityCollection = res.body as ActivityCollectionDto;
    expect(activityCollection.readableId).toBe(req.readableId);
    expect(activityCollection.parent).toBeDefined();
    expect(activityCollection.parent.pathUrl).toBe('/collections/javascript-guide/');
    expect(activityCollection.description).toEqual(req.description);
    expect(activityCollection.title).toEqual(req.title);
    expect(activityCollection.keywords).toEqual(expect.arrayContaining(req.keywords));
    expect(activityCollection.authors).toEqual(expect.arrayContaining(req.authors));
    expect(activityCollection.sections).toEqual(expect.arrayContaining([]));

    const resObj = await fileSystemService.fetchAsStream(activityCollection.parent.id, 'collection.json');
    const jsonStr = await text(resObj.stream);

    const actCollection = plainToInstance(ActivityCollectionJson, JSON.parse(jsonStr));
    expect(actCollection.readableId).toBe(req.readableId);

    expect(actCollection.description).toEqual(req.description);
    expect(actCollection.title).toEqual(req.title);
    expect(actCollection.keywords).toEqual(expect.arrayContaining(req.keywords));
    expect(actCollection.authors).toEqual(expect.arrayContaining(req.authors));
    expect(actCollection.sections).toEqual(expect.arrayContaining([]));

    await activityCollectionRepository.delete(activityCollection.id);
  });

  it('GET /activity-collections', async () => {
    const res = await request(app.getHttpServer()).get('/activity-collections').expect(200);
    const activityCollections = res.body as ActivityCollectionDto[];
    expect(activityCollections.length).toBe(1);
    const col = activityCollections[0];
    expect(col.title).toBe('Python Guide');
    expect(col.readableId).toBe('python-guide');
  });

  it('PUT /activity-collections/:id', async () => {
    const putReq = new ActivityCollectionDto();
    putReq.readableId = actCol.readableId;
    putReq.authors = actCol.authors;
    putReq.description = 'Very Long and Detailed Guide for Python';
    putReq.id = actCol.id;
    putReq.keywords = actCol.keywords;
    putReq.title = actCol.title;
    putReq.sections = actCol.sections;

    const res = await request(app.getHttpServer()).put(`/activity-collections/${actCol.id}`).send(putReq).expect(200);
    const col = res.body as ActivityCollectionDto;
    expect(col.title).toBe('Python Guide');
    expect(col.readableId).toBe('python-guide');
    expect(col.description).toBe(putReq.description);
  });

  afterAll(async () => {
    await activityCollectionRepository.clear();
    await storagePathRepository.clear();
    await app.close();
  });
});
