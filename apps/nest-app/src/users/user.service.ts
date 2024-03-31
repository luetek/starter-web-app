import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserRequestDto } from '@luetek/common-models';
import { UserEntity } from './entities/user.entity';
import { UserPasswordEntity } from './entities/user-password.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(UserPasswordEntity)
    private userPasswordsRepository: Repository<UserPasswordEntity>
  ) {}

  async updateUser(createUserDto: CreateUserRequestDto, id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    user.firstName = createUserDto.firstName || user.firstName;
    user.lastName = createUserDto.lastName || user.lastName;
    const userSaved = await this.usersRepository.save(user);
    const userPassword = await this.userPasswordsRepository.findOne({ where: { id } });
    userPassword.user = userSaved;
    if (createUserDto.password) {
      const hashedPassword = await bcrypt.hash(`${userSaved.userName}@${createUserDto.password}`, 10);
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
    user.userName = createUserDto.userName;
    user.status = 'CREATED';
    const userSaved = await this.usersRepository.save(user);
    const userPassword = new UserPasswordEntity();
    userPassword.user = userSaved;
    const hashedPassword = await bcrypt.hash(`${user.userName}@${createUserDto.password}`, 10);
    userPassword.password = hashedPassword;
    userPassword.failedPasswordCount = 0;
    await this.userPasswordsRepository.save(userPassword);
    return userSaved;
  }

  async findOne(userId: number) {
    return this.usersRepository.findOne({ where: { id: userId } });
  }
}
