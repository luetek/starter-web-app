import { Controller, Request, Post, UseGuards, Delete, Param, Get, Body, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleCredential, UserAccessTokenDto, UserDto } from '@luetek/common-models';
import { MapInterceptor } from '@automapper/nestjs';
import { AuthService } from './auth.service';
import { UserAccessTokenEntity } from './entities/user-access-token.entity';
import { UserEntity } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseInterceptors(MapInterceptor(UserAccessTokenEntity, UserAccessTokenDto))
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('google-login')
  async createViaGoogle(@Body() googleCredential: GoogleCredential) {
    return this.authService.googleLogin(googleCredential);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('user-access-tokens/:id')
  async deleteUserToken(@Param('id') id: string) {
    const res = await this.authService.deleteToken(id);
    return { deleted: res.affected === 1 };
  }

  @UseInterceptors(MapInterceptor(UserEntity, UserDto))
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mark-user-active')
  markUserActive(@Request() req) {
    return this.authService.markUserActive(req.user);
  }
}
