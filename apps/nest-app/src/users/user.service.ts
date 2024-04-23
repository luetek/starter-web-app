import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserRequestDto, GoogleCredential, UpdateUserRequestDto } from '@luetek/common-models';
import axios from 'axios';
import { UserEntity } from './entities/user.entity';
import { UserPasswordEntity } from './entities/user-password.entity';
import { UserAuthProviderEntity } from './entities/user-auth-provider.entity';
import { ReqLogger } from '../logger/req-logger';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(UserPasswordEntity)
    private userPasswordsRepository: Repository<UserPasswordEntity>,
    @InjectRepository(UserAuthProviderEntity)
    private userAuthProviderRepository: Repository<UserAuthProviderEntity>,
    private logger: ReqLogger
  ) {
    this.logger.setContext(UserService.name);
  }

  async updateUser(updateUserDto: UpdateUserRequestDto, id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    user.firstName = updateUserDto.firstName || user.firstName;
    user.lastName = updateUserDto.lastName || user.lastName;
    const userSaved = await this.usersRepository.save(user);
    const userPassword = (await this.userPasswordsRepository.findOne({ where: { id } })) || new UserPasswordEntity();
    userPassword.user = userSaved;
    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(`${updateUserDto.username}@${updateUserDto.password}`, 10);
      userPassword.userName = updateUserDto.username;
      userPassword.password = hashedPassword;
      userPassword.failedPasswordCount = 0;
    }
    const userPasswordSaved = await this.userPasswordsRepository.save(userPassword);
    userSaved.userPassword = userPasswordSaved;
    delete userPasswordSaved.user;
    return userSaved;
  }

  async createUser(createUserDto: CreateUserRequestDto) {
    const user = new UserEntity();
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;
    user.primaryEmail = createUserDto.primaryEmail;
    user.status = 'CREATED';
    const userSaved = await this.usersRepository.save(user);

    const userPassword = new UserPasswordEntity();
    userPassword.user = userSaved;
    userPassword.userName = createUserDto.userName;
    const hashedPassword = await bcrypt.hash(`${createUserDto.userName}@${createUserDto.password}`, 10);
    userPassword.password = hashedPassword;
    userPassword.failedPasswordCount = 0;
    const userPasswordSaved = await this.userPasswordsRepository.save(userPassword);
    userSaved.userPassword = userPasswordSaved;
    delete userPasswordSaved.user;
    return userSaved;
  }

  async createGoogleUser(googleCredential: GoogleCredential) {
    const res = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${googleCredential.access_token}`,
      {
        headers: {
          Authorization: `Bearer ${googleCredential.access_token}`,
          Accept: 'application/json',
        },
      }
    );
    const profile = res.data;
    const user = new UserEntity();
    user.firstName = profile.given_name;
    user.lastName = profile.family_name;
    user.primaryEmail = profile.email;
    user.status = 'ACTIVE';

    const userSaved = await this.usersRepository.save(user);
    const userAuthProvider = new UserAuthProviderEntity();
    userAuthProvider.providerId = profile.id;
    userAuthProvider.provider = 'GOOGLE';
    userAuthProvider.user = userSaved;
    const providerEntity = await this.userAuthProviderRepository.save(userAuthProvider);
    this.logger.log(` provider entity = ${JSON.stringify(providerEntity)}`);
    return userSaved;
  }

  async findOne(userId: number) {
    return this.usersRepository.findOne({ where: { id: userId }, relations: ['userPassword'] });
  }
}
