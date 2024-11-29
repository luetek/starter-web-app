import request from 'supertest';
import fs from 'fs';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoragePathDto } from '@luetek/common-models';
import { Readable } from 'typeorm/platform/PlatformTools';
import { AcceptanceTestAppModule } from '../test-utils/acceptance-test-app.module';
import { StoragePathEntity } from '../storage-path/entities/storage-path.entity';
import { CreateFolderRequestDto } from './dtos/create-folder-request.dto';
import { FileSystemService } from './file-system.service';

describe('Storage Api/Acceptance/E2E Tests', () => {
  let app: INestApplication;
  let rootDir: string;
  let storagePathRepository: Repository<StoragePathEntity>;
  let fileSystemService: FileSystemService;
  let parentFolder: StoragePathDto;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AcceptanceTestAppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    storagePathRepository = app.get<Repository<StoragePathEntity>>(getRepositoryToken(StoragePathEntity));
    fileSystemService = app.get<FileSystemService>(FileSystemService);
    rootDir = app.get('ROOT_FS_DIR');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await storagePathRepository.clear();
    fs.rmSync(rootDir, { recursive: true, force: true });
    // Init data for tests
    const req = new CreateFolderRequestDto();
    req.parentId = null;
    req.name = 'accounts';
    parentFolder = await fileSystemService.createDirectory(req);
    const fileContent = 'Hello There!!!';
    const file: Express.Multer.File = {
      buffer: null,
      stream: Readable.from(Buffer.from(fileContent)),
      originalname: 'intro.txt',
      size: fileContent.length,
      mimetype: 'text/plain',
      encoding: 'unknown',
      fieldname: '',
      destination: '',
      filename: '',
      path: '',
    };
    await fileSystemService.upload(file, parentFolder.id);
  });

  it('POST /storage/folder', async () => {
    const req = new CreateFolderRequestDto();
    req.parentId = parentFolder.id;
    req.name = 'deepakk87';
    const res = await request(app.getHttpServer()).post('/storage/folder').send(req).expect(201);
    const storageDto = res.body as StoragePathDto;
    expect(storageDto.name).toBe(req.name);
    expect(storageDto.pathUrl).toBe('/accounts/deepakk87/');
  });

  it('POST /storage/:id/upload', async () => {
    const buffer = Buffer.from('Hello World!!!');
    const parentId = parentFolder.id;
    const res = await request(app.getHttpServer())
      .post(`/storage/${parentId}/upload`)
      .attach('file', buffer, 'world.txt')
      .expect(201);
    const fileDto = res.body as StoragePathDto;
    expect(fileDto.name).toBe('world.txt');
    expect(fileDto.pathUrl).toBe('/accounts/world.txt');
  });

  it('POST /storage/:id/upload with txt file', async () => {
    const parentId = parentFolder.id;
    const res = await request(app.getHttpServer())
      .post(`/storage/${parentId}/upload`)
      .attach('file', 'apps/nest-app/src/test-utils/test-fs-data/hello.txt')
      .expect(201);
    const fileDto = res.body as StoragePathDto;
    expect(fileDto.name).toBe('hello.txt');
    expect(fileDto.pathUrl).toBe('/accounts/hello.txt');
  });

  it('GET /storage/:id/stream/:filePath', async () => {
    const parentId = parentFolder.id;
    const res = await request(app.getHttpServer()).get(`/storage/${parentId}/stream/intro.txt`).expect(200);
    const content = res.text;
    expect(content).toBe('Hello There!!!');
  });
  afterAll(async () => {
    await app.close();
  });
});
