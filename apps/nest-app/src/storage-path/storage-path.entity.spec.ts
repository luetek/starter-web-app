import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageType } from '@luetek/common-models';
import { AcceptanceTestAppModule } from '../test-utils/acceptance-test-app.module';
import { StoragePathEntity } from './entities/storage-path.entity';

describe('StoragePath persistence tests', () => {
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
  });

  it('create file and folder usecases and test tree view - happy case scenario', async () => {
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

    const treeRepository = storagePathRepository.manager.getTreeRepository(StoragePathEntity);
    const profile = await storagePathRepository.findOne({ where: { pathUrl: '/accounts/' } });
    const pr = await treeRepository.findDescendantsTree(profile);
    expect(pr.name).toBe('accounts');
    expect(pr.pathUrl).toBe('/accounts/');
    expect(pr.children.length).toBe(1);
    expect(pr.children[0].name).toBe('deepakk87');
    expect(pr.children[0].pathUrl).toBe('/accounts/deepakk87/');
    expect(pr.children[0].children.length).toBe(1);
    expect(pr.children[0].children[0].name).toBe('js.json');
    expect(pr.children[0].children[0].pathUrl).toBe('/accounts/deepakk87/js.json');
  });

  afterAll(async () => {
    await storagePathRepository.clear();
    await app.close();
  });
});
