import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageType } from '@luetek/common-models';
import { instanceToPlain } from 'class-transformer';
import { AcceptanceTestAppModule } from '../test-utils/acceptance-test-app.module';
import { StoragePathEntity } from '../storage-path/entities/storage-path.entity';
import { ActivityCollectionEntity } from './entities/activity-collection.entity';
import { ActivityEntity } from './entities/activity.entity';

describe('Activity Collection Persistence Tests', () => {
  let app: INestApplication;
  let storagePathRepository: Repository<StoragePathEntity>;
  let activityCollectionRepository: Repository<ActivityCollectionEntity>;
  let activityReposity: Repository<ActivityEntity>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AcceptanceTestAppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    storagePathRepository = app.get<Repository<StoragePathEntity>>(getRepositoryToken(StoragePathEntity));
    activityCollectionRepository = app.get<Repository<ActivityCollectionEntity>>(
      getRepositoryToken(ActivityCollectionEntity)
    );
    activityReposity = app.get<Repository<ActivityEntity>>(getRepositoryToken(ActivityEntity));
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await activityReposity.clear();
    await activityCollectionRepository.clear();
    await storagePathRepository.clear();
  });

  it('create collection and folder usecases - happy case scenario', async () => {
    const root = new StoragePathEntity();
    root.name = 'collections';
    root.storageType = StorageType.FOLDER;
    const savedRoot = await storagePathRepository.save(root);

    const collection = new ActivityCollectionEntity();
    collection.authors = ['deepakk87', 'aartic88'];
    collection.description = 'Javascript deepdive';
    collection.keywords = ['Javascript'];
    collection.parent = savedRoot;
    collection.readableId = 'javascript-deepdive';
    collection.title = 'Javascript Deepdive';
    collection.sections = [
      { sectionId: 1, title: 'introduction' },
      { sectionId: 1, title: 'getting-started' },
    ];

    const savedCollection = await activityCollectionRepository.save(collection);

    const plainObj = instanceToPlain(savedCollection);
    // console.log(plainObj);
    expect(plainObj).toBeDefined();
    expect(plainObj.title).toBe(collection.title);
  });

  it('create activity, collection and folder usecases - happy case scenario', async () => {
    const root = new StoragePathEntity();
    root.name = 'collections';
    root.storageType = StorageType.FOLDER;
    const savedRoot = await storagePathRepository.save(root);

    const collection = new ActivityCollectionEntity();
    collection.authors = ['deepakk87', 'aartic88'];
    collection.description = 'Python deepdive';
    collection.keywords = ['Python'];
    collection.parent = savedRoot;
    collection.readableId = 'python-deepdive';
    collection.title = 'Python Deepdive';
    collection.sections = [
      { sectionId: 1, title: 'introduction' },
      { sectionId: 2, title: 'getting-started' },
    ];

    const savedCollection = await activityCollectionRepository.save(collection);

    const activity1 = new ActivityEntity();
    activity1.description = 'History of Python';
    activity1.title = 'introduction';
    activity1.collection = savedCollection;
    activity1.parent = savedRoot;
    activity1.readableId = 'introduction-python';
    activity1.sectionId = 1;
    activity1.orderId = 1;
    activity1.keywords = ['python'];

    const activity1Saved = await activityReposity.save(activity1);

    const activity2 = new ActivityEntity();
    activity2.description = 'Getting started';
    activity2.title = 'Getting started';
    activity2.collection = savedCollection;
    activity2.parent = savedRoot;
    activity2.readableId = 'getting-started-python';
    activity2.sectionId = 2;
    activity2.orderId = 2;
    activity2.keywords = ['python'];

    const activity2Saved = await activityReposity.save(activity2);

    const plainObj1 = instanceToPlain(activity1Saved);
    const plainObj2 = instanceToPlain(activity2Saved);
    console.log(plainObj1);
    console.log(plainObj2);

    expect(plainObj1).toBeDefined();
    expect(plainObj1.title).toBe(activity1.title);
    expect(plainObj2).toBeDefined();
    expect(plainObj2.title).toBe(activity2.title);
  });

  afterAll(async () => {
    await app.close();
  });
});
