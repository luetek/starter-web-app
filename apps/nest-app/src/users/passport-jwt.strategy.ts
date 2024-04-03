import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserAccessTokenEntity } from './entities/user-access-token.entity';
// https://docs.nestjs.com/techniques/caching
@Injectable()
export class PassportJwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(UserAccessTokenEntity) private userTokensRepository: Repository<UserAccessTokenEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_KEY'),
    });
  }

  async validate(payload: { username: string; userId: number; tokenId: number }) {
    const token = (await this.cacheManager.get(`tokenId-${payload.tokenId}`)) as UserAccessTokenEntity;

    // Use cache to speed up authentication
    if (!token) {
      const tokenEntity = await this.userTokensRepository.findOne({ where: { id: payload.tokenId } });
      await this.userTokensRepository.save(tokenEntity); // Update usage data
      if (!tokenEntity) {
        // No token found
        throw new UnauthorizedException();
      }
      await this.cacheManager.set(`tokenId-${tokenEntity.id}`, tokenEntity, 10000); // Cache for 10 sec
    }
    return { id: payload.userId, username: payload.username };
  }
}
