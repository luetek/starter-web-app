import { AutoMap } from '@automapper/classes';
import { IsEmail, Length } from 'class-validator';
import { User, UserAccessToken } from './user.interface';

export class UserPasswordDto {
  @AutoMap()
  userName!: string;
}

export class UserDto implements User {
  @AutoMap()
  id!: number;

  @AutoMap()
  firstName!: string;

  @AutoMap()
  lastName!: string;

  @AutoMap()
  primaryEmail!: string;

  @AutoMap(() => UserPasswordDto)
  userPassword!: UserPasswordDto;
}

export class UserAccessTokenDto implements UserAccessToken {
  @AutoMap()
  id?: number;

  @AutoMap()
  token?: string;

  @AutoMap()
  createdAt?: Date;

  @AutoMap(() => UserDto)
  user?: UserDto;
}

export class CreateUserRequestDto implements Omit<User, 'id'> {
  @Length(1, 20)
  firstName!: string;

  @Length(1, 20)
  lastName!: string;

  @IsEmail()
  primaryEmail!: string;

  @Length(5, 20)
  userName!: string;

  @Length(5, 20)
  password!: string;

  @Length(5, 20)
  reenterPassword!: string;
}

export class GoogleCredential {
  access_token!: string;
}

export class UpdateUserRequestDto {
  @Length(1, 20)
  firstName!: string;

  @Length(1, 20)
  lastName!: string;

  @Length(5, 20)
  username!: string;

  @Length(5, 20)
  renterPassword!: string;

  @Length(5, 20)
  password!: string;
}

export class PasswordAuthRequestDto {
  @Length(5, 20)
  username!: string;

  @Length(5, 20)
  password!: string;
}
