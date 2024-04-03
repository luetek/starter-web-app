import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { GoogleCredential } from '@luetek/common-models';
import axios from 'axios';
import { UserEntity } from './entities/user.entity';
import { UserPasswordEntity } from './entities/user-password.entity';
import { UserAccessTokenEntity } from './entities/user-access-token.entity';
import { ReqLogger } from '../logger/req-logger';
import { UserAuthProviderEntity } from './entities/user-auth-provider.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(UserPasswordEntity)
    private userPasswordsRepository: Repository<UserPasswordEntity>,
    @InjectRepository(UserAccessTokenEntity)
    private userAccessTokensRepository: Repository<UserAccessTokenEntity>,
    @InjectRepository(UserPasswordEntity)
    private userPasswordRepository: Repository<UserPasswordEntity>,
    @InjectRepository(UserAuthProviderEntity)
    private userAuthProviderRepository: Repository<UserAuthProviderEntity>,
    private logger: ReqLogger
  ) {
    this.logger.setContext(AuthService.name);
  }

  async markUserActive(user: UserEntity) {
    // eslint-disable-next-line no-param-reassign
    user.status = 'ACTIVE';
    return this.usersRepository.save(user);
  }

  async validateUserPassword(userName: string, pass: string): Promise<UserEntity> {
    const error = new UnauthorizedException('Auth Error');
    const userPassword = await this.userPasswordRepository.findOne({ where: { userName }, relations: ['user'] });
    if (!userPassword) {
      throw error;
    }
    const { user } = userPassword;
    if (userPassword.user.status !== 'ACTIVE') {
      throw new UnauthorizedException(`User is ${user.status}`);
    }
    this.logger.log(`User is ${JSON.stringify(user)}`);
    /**
     * In a real application, you wouldn't store a password in plain text.
     * You'd instead use a library like bcrypt, with a salted one-way hash algorithm.
     * With that approach, you'd only store hashed passwords, and then compare the
     * stored password to a hashed version of the incoming password, thus never storing
     * or exposing user passwords in plain text.
     * https://docs.nestjs.com/security/encryption-and-hashing
     * {@link UsersService#createUser}
     */
    const isMatch = await bcrypt.compare(`${userName}@${pass}`, userPassword.password);

    if (!isMatch) {
      this.logger.log('Password not Match');
      userPassword.failedPasswordCount += 1;
      if (userPassword.failedPasswordCount >= 5) {
        user.status = 'LOCKED';
        await this.usersRepository.save(user);
        throw new Error('Your user account is locked due to incorrect passwords');
      }
      await this.userPasswordsRepository.save(userPassword);
      throw error;
    }
    userPassword.failedPasswordCount = 0;
    await this.userPasswordsRepository.save(userPassword);
    return user;
  }

  async login(user: UserEntity) {
    // Delete older token
    const userAccessTokens = await this.userAccessTokensRepository.find({ where: { user } });
    userAccessTokens?.sort((a, b) => a.updatedAt.getMilliseconds() - b.updatedAt.getMilliseconds());
    const N = userAccessTokens.length - 5;
    for (let i = 0; i < N; i += 1) {
      this.userAccessTokensRepository.delete(userAccessTokens[i]);
    }
    // Create a new Token
    return this.userAccessTokensRepository.manager.transaction(async (em) => {
      const userAccessToken = new UserAccessTokenEntity();
      userAccessToken.user = user as UserEntity;
      userAccessToken.token = 'IN_PROGRESS';
      const tokenEntity = await em.save(userAccessToken);
      const payload = { userId: user.id, tokenId: tokenEntity.id };
      tokenEntity.token = this.jwtService.sign(payload);
      const tokenSaved = await em.save(userAccessToken);
      this.logger.log(`Token Created  ${tokenSaved.id}`);
      return tokenSaved;
    });
  }

  async googleLogin(googleCredential: GoogleCredential) {
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
    const providerId = profile.id;
    const provider = 'GOOGLE';
    const userProvider = await this.userAuthProviderRepository.findOne({
      where: { providerId, provider },
      relations: ['user'],
    });
    if (!userProvider) {
      throw new Error('User not found');
    }
    const { user } = userProvider;
    // Delete older token
    const userAccessTokens = await this.userAccessTokensRepository.find({ where: { user } });
    userAccessTokens?.sort((a, b) => a.updatedAt.getMilliseconds() - b.updatedAt.getMilliseconds());
    const N = userAccessTokens.length - 5;
    for (let i = 0; i < N; i += 1) {
      this.userAccessTokensRepository.delete(userAccessTokens[i]);
    }

    // Create a new Token
    return this.userAccessTokensRepository.manager.transaction(async (em) => {
      const userAccessToken = new UserAccessTokenEntity();
      userAccessToken.user = user as UserEntity;
      userAccessToken.token = 'IN_PROGRESS';
      const tokenEntity = await em.save(userAccessToken);
      const payload = { userId: user.id, tokenId: tokenEntity.id };
      tokenEntity.token = this.jwtService.sign(payload);
      const tokenSaved = await em.save(userAccessToken);
      this.logger.log(`Token Created  ${tokenSaved.id}`);
      return tokenSaved;
    });
  }

  async deleteToken(token: string) {
    return this.userAccessTokensRepository.delete({ token });
  }
}
