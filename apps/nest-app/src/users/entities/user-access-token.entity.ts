import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserAccessToken } from '@luetek/common-models';
import { UserEntity } from './user.entity';

/**
 * We want to keep the password seperate from UserEntity as it is possible a User may be using only
 * oauth with faccebook or google for login.
 */

@Entity()
export class UserAccessTokenEntity implements UserAccessToken {
  @AutoMap()
  @PrimaryGeneratedColumn()
  id: number;

  @AutoMap()
  @Column()
  token: string;

  @AutoMap()
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
