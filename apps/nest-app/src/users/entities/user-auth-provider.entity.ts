import { AutoMap } from '@automapper/classes';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class UserAuthProviderEntity {
  @PrimaryColumn({ name: 'id' })
  id: number;

  @AutoMap()
  @Column()
  providerId: string;

  @AutoMap()
  @Column()
  provider: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'id' })
  user: UserEntity;
}
