import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserRequestDto, GoogleCredential } from '@luetek/common-models';
import axios from 'axios';
import { UserEntity } from './entities/user.entity';
import { UserPasswordEntity } from './entities/user-password.entity';
import { UserAuthProviderEntity } from './entities/user-auth-provider.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(UserPasswordEntity)
    private userPasswordsRepository: Repository<UserPasswordEntity>,
    @InjectRepository(UserAuthProviderEntity)
    private userAuthProviderRepository: Repository<UserAuthProviderEntity>
  ) {}

  async updateUser(createUserDto: CreateUserRequestDto, id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    user.firstName = createUserDto.firstName || user.firstName;
    user.lastName = createUserDto.lastName || user.lastName;
    const userSaved = await this.usersRepository.save(user);
    const userPassword = await this.userPasswordsRepository.findOne({ where: { id } });
    userPassword.user = userSaved;
    if (createUserDto.password) {
      const hashedPassword = await bcrypt.hash(`${userPassword.userName}@${createUserDto.password}`, 10);
      userPassword.password = hashedPassword;
      userPassword.failedPasswordCount = 0;
    }
    await this.userPasswordsRepository.save(userPassword);
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
    await this.userPasswordsRepository.save(userPassword);
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
    await this.userAuthProviderRepository.save(userAuthProvider);

    return userSaved;
  }

  async findOne(userId: number) {
    return this.usersRepository.findOne({ where: { id: userId } });
  }
}
