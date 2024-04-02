import { AutoMap } from '@automapper/classes';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '@luetek/common-models';

export type UserStatus = 'LOCKED' | 'ACTIVE' | 'UNVERIFIED' | 'CREATED';
@Entity()
export class UserEntity implements User {
  @AutoMap()
  @PrimaryGeneratedColumn()
  id: number;

  @AutoMap()
  @Column()
  firstName: string;

  @AutoMap()
  @Column()
  lastName: string;

  @AutoMap()
  @Column({ unique: true })
  primaryEmail: string;

  @Index('user-status-idx')
  @Column({ nullable: true })
  status: UserStatus;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
