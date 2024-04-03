import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { UserPasswordEntity } from './entities/user-password.entity';
import { UserController } from './user.controller';
import { UserAutoMapperProfile } from './user-auto-mapper.profile';
import { UserAuthProviderEntity } from './entities/user-auth-provider.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserAccessTokenEntity } from './entities/user-access-token.entity';
import { PassportLocalStrategy } from './passport-local.strategy';
import { PassportJwtStrategy } from './passport-jwt.strategy';

@Module({
  imports: [
    CacheModule.register(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      global: true,
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_KEY'),
      }),
      inject: [ConfigService],
    }),
    PassportModule,
    LoggerModule,
    TypeOrmModule.forFeature([UserEntity, UserPasswordEntity, UserAuthProviderEntity, UserAccessTokenEntity]),
  ],
  controllers: [UserController, AuthController],
  providers: [UserService, UserAutoMapperProfile, AuthService, PassportLocalStrategy, PassportJwtStrategy],
  exports: [UserService, AuthService],
})
export class UserModule {}
