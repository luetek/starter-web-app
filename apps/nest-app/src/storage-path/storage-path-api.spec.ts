import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedStoragePathDto, StorageType } from '@luetek/common-models';
import { AcceptanceTestAppModule } from '../test-utils/acceptance-test-app.module';
import { StoragePathEntity } from './entities/storage-path.entity';

describe('StoragePath Acceptance/E2E Tests', () => {
  let app: INestApplication;
  let storagePathRepository: Repository<StoragePathEntity>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AcceptanceTestAppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    storagePathRepository = app.get<Repository<StoragePathEntity>>(getRepositoryToken(StoragePathEntity));

    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    await storagePathRepository.clear();
    // Init data for tests
    const root = new StoragePathEntity();
    root.name = 'accounts';
    root.storageType = StorageType.FOLDER;
    const savedRoot = await storagePathRepository.save(root);

    const userAccount = new StoragePathEntity();
    userAccount.name = 'deepakk87';
    userAccount.parent = savedRoot;
    userAccount.storageType = StorageType.FOLDER;
    const savedAccount = await storagePathRepository.save(userAccount);

    const profileMetadata = new StoragePathEntity();
    profileMetadata.name = 'js.json';
    profileMetadata.parent = savedAccount;
    profileMetadata.storageType = StorageType.FILE;

    await storagePathRepository.save(profileMetadata);
  });

  it('GET /storage-paths', async () => {
    const res = await request(app.getHttpServer()).get('/storage-paths').expect(200);
    const paginatedRes = res.body as PaginatedStoragePathDto;
    expect(paginatedRes.data.length).toBe(3);
    expect(paginatedRes.data.map((item) => item.pathUrl)).toEqual(
      expect.arrayContaining(['/accounts/deepakk87/js.json', '/accounts/deepakk87/', '/accounts/'])
    );
    // console.log(paginatedRes);
    expect(paginatedRes.meta.totalItems).toBe(3);
    expect(paginatedRes.meta.currentPage).toBe(1);
    expect(paginatedRes.meta.totalPages).toBe(1);
    expect(paginatedRes.meta.itemsPerPage).toBe(20);
  });

  it('GET /storage-paths?filter.parentId=$null', async () => {
    const res = await request(app.getHttpServer()).get('/storage-paths?filter.parentId=$null').expect(200);
    const paginatedRes = res.body as PaginatedStoragePathDto;
    expect(paginatedRes.data.length).toBe(1);
    expect(paginatedRes.data[0].pathUrl).toEqual('/accounts/');
    expect(paginatedRes.data[0].name).toEqual('accounts');
    expect(paginatedRes.meta.totalItems).toBe(1);
    expect(paginatedRes.meta.currentPage).toBe(1);
    expect(paginatedRes.meta.totalPages).toBe(1);
    expect(paginatedRes.meta.itemsPerPage).toBe(20);
  });

  it('GET /storage-paths?filter.pathUrl=/accounts/deepakk87/', async () => {
    const res = await request(app.getHttpServer())
      .get('/storage-paths?filter.pathUrl=/accounts/deepakk87/')
      .expect(200);
    const paginatedRes = res.body as PaginatedStoragePathDto;
    expect(paginatedRes.data.length).toBe(1);
    expect(paginatedRes.data[0].pathUrl).toEqual('/accounts/deepakk87/');
    expect(paginatedRes.data[0].name).toEqual('deepakk87');
    expect(paginatedRes.meta.totalItems).toBe(1);
    expect(paginatedRes.meta.currentPage).toBe(1);
    expect(paginatedRes.meta.totalPages).toBe(1);
    expect(paginatedRes.meta.itemsPerPage).toBe(20);
  });

  afterAll(async () => {
    await app.close();
  });
});
