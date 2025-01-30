import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcceptanceTestAppModule } from '../test-utils/acceptance-test-app.module';
import { UserEntity } from './entities/user.entity';
import { UserPasswordEntity } from './entities/user-password.entity';
import { UserAccessTokenEntity } from './entities/user-access-token.entity';

describe('Auth Acceptance/E2E Tests', () => {
  let app: INestApplication;
  let usersRepository: Repository<UserEntity>;
  let userPasswordsRepository: Repository<UserPasswordEntity>;
  let userAccessTokensRepository: Repository<UserAccessTokenEntity>;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AcceptanceTestAppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    usersRepository = app.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    userPasswordsRepository = app.get<Repository<UserPasswordEntity>>(getRepositoryToken(UserPasswordEntity));
    userAccessTokensRepository = app.get<Repository<UserAccessTokenEntity>>(getRepositoryToken(UserAccessTokenEntity));
    await app.init();
    await userPasswordsRepository.clear();
    await usersRepository.clear();
    await userAccessTokensRepository.clear();
  });

  it('/POST login with password usecase - happy case scenario', async () => {
    // Setup
    const user = new UserEntity();
    user.firstName = 'Depss';
    user.lastName = 'Kumr';
    user.primaryEmail = 'deeep@gmail.com';
    user.status = 'ACTIVE';
    const userSaved = await usersRepository.save(user);
    const userPassword = new UserPasswordEntity();
    userPassword.userName = 'deep878';
    const plainPassword = '12345@tyre';
    userPassword.password = await bcrypt.hash(`${userPassword.userName}@${plainPassword}`, 10);
    userPassword.user = userSaved;
    userPassword.failedPasswordCount = 0;
    const userPasswordSaved = await userPasswordsRepository.save(userPassword);
    // Execute Test
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      // Make sure the username and password field matches, No typechecking here.
      .send({ username: userPassword.userName, password: plainPassword });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toMatchObject({
      firstName: user.firstName,
      lastName: user.lastName,
      primaryEmail: user.primaryEmail,
    });
    const res2 = await request(app.getHttpServer())
      .delete(`/auth/user-access-tokens/${res.body.id}`)
      .set('Authorization', `Bearer ${res.body.token}`);
    expect(res2.status).toBe(200);
    expect(await userAccessTokensRepository.count()).toBe(0);
    // Cleanup
    await userPasswordsRepository.delete(userPasswordSaved);
    await usersRepository.delete(userSaved);
  });

  afterAll(async () => {
    await userPasswordsRepository.clear();
    await usersRepository.clear();
    await userAccessTokensRepository.clear();
    await app.close();
  });
});
