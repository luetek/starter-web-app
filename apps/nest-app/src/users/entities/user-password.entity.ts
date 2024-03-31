import { AutoMap } from '@automapper/classes';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

/**
 * We want to keep the password seperate from UserEntity as it is possible a User may be using only
 * oauth with facebook or google for login.
 */

@Entity()
export class UserPasswordEntity {
  @PrimaryColumn({ name: 'id' })
  id: number;

  @AutoMap()
  @Column()
  password: string;

  @Column({ nullable: true })
  failedPasswordCount: number;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'id' })
  user: UserEntity;
}
