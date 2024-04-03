import { Controller, Request, Post, UseGuards, Delete, Param, Get, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleCredential } from '@luetek/common-models';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
