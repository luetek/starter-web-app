import { Controller, Post, Param, Body, Get, Put, UseInterceptors } from '@nestjs/common';
import { CreateUserRequestDto, GoogleCredential, UserDto } from '@luetek/common-models';
import { Recaptcha } from '@nestlab/google-recaptcha';
import { MapInterceptor } from '@automapper/nestjs';
import { UserService } from './user.service';
import { UserEntity } from './entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private usersService: UserService) {}

  @UseInterceptors(MapInterceptor(UserEntity, UserDto))
  @Recaptcha()
  @Post()
  async create(@Body() createUserDto: CreateUserRequestDto) {
    return this.usersService.createUser(createUserDto);
  }

  @UseInterceptors(MapInterceptor(UserEntity, UserDto))
  @Post('google')
  async createViaGoogle(@Body() googleCredential: GoogleCredential) {
    return this.usersService.createGoogleUser(googleCredential);
  }

  @UseInterceptors(MapInterceptor(UserEntity, UserDto))
  @Put(':id')
  async update(@Body() createUserDto: CreateUserRequestDto, @Param('id') id: number) {
    return this.usersService.updateUser(createUserDto, id);
  }

  @UseInterceptors(MapInterceptor(UserEntity, UserDto))
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }
}
