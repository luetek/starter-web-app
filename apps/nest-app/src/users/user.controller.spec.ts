import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { CreateUserRequestDto, UpdateUserRequestDto, UserDto } from '@luetek/common-models';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcceptanceTestAppModule } from '../test-utils/acceptance-test-app.module';
import { UserEntity } from './entities/user.entity';
import { UserPasswordEntity } from './entities/user-password.entity';

describe('Users Acceptance/E2E Tests', () => {
  let app: INestApplication;
  let usersRepository: Repository<UserEntity>;
  let userPasswordsRepository: Repository<UserPasswordEntity>;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AcceptanceTestAppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    usersRepository = app.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    userPasswordsRepository = app.get<Repository<UserPasswordEntity>>(getRepositoryToken(UserPasswordEntity));
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await userPasswordsRepository.clear();
    await usersRepository.clear();
  });

  it('POST create user usecase - happy case scenario', async () => {
    const createUserDto = new CreateUserRequestDto();
    createUserDto.firstName = 'Depss';
    createUserDto.lastName = 'Kumr';
    createUserDto.password = '12345@tyre';
    createUserDto.reenterPassword = '12345@tyre';
    createUserDto.primaryEmail = 'deeep@gmail.com';
    createUserDto.userName = 'deep878';
    const res = await request(app.getHttpServer()).post('/users').send(createUserDto);
    expect(res.status).toBe(201);

    expect(res.body).toMatchObject({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      primaryEmail: createUserDto.primaryEmail,
    });
    expect(res.body.password).toBeUndefined();

    const user = await usersRepository.findOne({ where: { id: res.body.id } });
    expect(user).toBeDefined();
    expect(user.status).toBe('CREATED');
  });

  it('POST create user - failed due to validation error', async () => {
    const createUserDto = new CreateUserRequestDto();
    createUserDto.firstName = '';
    createUserDto.lastName = '';
    createUserDto.password = '12345@tyre';
    createUserDto.reenterPassword = '12345@tyre';
    createUserDto.primaryEmail = 'deeep';
    createUserDto.userName = 'deep878';
    const res = await request(app.getHttpServer()).post('/users').send(createUserDto);
    expect(res.status).toBe(400);
  });

  it('GET user findOne usecase - happy case scenario', async () => {
    const createUserDto = new CreateUserRequestDto();
    createUserDto.firstName = 'Depssus';
    createUserDto.lastName = 'Kumr';
    createUserDto.password = '12345@tyre';
    createUserDto.reenterPassword = '12345@tyre';
    createUserDto.primaryEmail = 'deeepad@gmail.com';
    createUserDto.userName = 'deep87895';
    const res = await request(app.getHttpServer()).post('/users').send(createUserDto);
    expect(res.status).toBe(201);
    const res2 = await request(app.getHttpServer()).get(`/users/${res.body.id}`);
    expect(res2.status).toBe(200);
    const user = res2.body;
    expect(user).toBeDefined();
    expect(user.status).toBeUndefined();
    expect(user.primaryEmail).toBe(createUserDto.primaryEmail);
  });

  it('PUT user update usecase - happy case scenario', async () => {
    const createUserDto = new CreateUserRequestDto();
    createUserDto.firstName = 'Depssus';
    createUserDto.lastName = 'Kumr';
    createUserDto.password = '12345@tyre';
    createUserDto.reenterPassword = '12345@tyre';
    createUserDto.primaryEmail = 'gheepad@gmail.com';
    createUserDto.userName = 'deep8723';
    const res = await request(app.getHttpServer()).post('/users').send(createUserDto);
    expect(res.status).toBe(201);
    const updateUserRequestDto = new UpdateUserRequestDto();
    updateUserRequestDto.firstName = createUserDto.firstName;
    updateUserRequestDto.lastName = createUserDto.lastName;
    updateUserRequestDto.username = 'deeep8966';
    updateUserRequestDto.password = '454rrer3434';
    updateUserRequestDto.renterPassword = '454rrer3434';
    const res3 = await request(app.getHttpServer()).put(`/users/${res.body.id}`).send(updateUserRequestDto);
    expect(res3.status).toBe(200);
    const res2 = await request(app.getHttpServer()).get(`/users/${res.body.id}`);
    expect(res2.status).toBe(200);
    const user = res2.body as UserDto;
    expect(user).toBeDefined();
    expect(user.primaryEmail).toBe(createUserDto.primaryEmail);
    expect(user.firstName).toBe(createUserDto.firstName);
    expect(user.userPassword.userName).toBe(updateUserRequestDto.username);
    expect(user.lastName).toBe(createUserDto.lastName);
  });

  afterAll(async () => {
    await userPasswordsRepository.clear();
    await usersRepository.clear();
    await app.close();
  });
});
