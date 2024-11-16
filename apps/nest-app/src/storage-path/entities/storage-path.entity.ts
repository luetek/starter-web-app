import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { Length, Matches } from 'class-validator';
import { StorageType } from './common';

@Entity()
@Index('file_path_unique', ['name', 'parentId'], { unique: true })
@Tree('materialized-path')
export class StoragePathEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Matches(/([a-z]|[0-9][.][-])+/)
  @Length(4, 32)
  @Column()
  name: string;

  @Column({ readonly: true })
  pathUrl: string;

  @Column({ readonly: true, nullable: true })
  parentId: number;

  @AutoMap()
  @Column({
    enum: StorageType,
    nullable: false,
  })
  storageType: StorageType;

  @TreeChildren()
  children: StoragePathEntity[];

  @TreeParent()
  parent: StoragePathEntity;

  @BeforeInsert()
  @BeforeUpdate()
  updateCounters() {
    const name = this.storageType === StorageType.FOLDER ? `${this.name}/` : this.name;
    const parentPathUrl = this.parent ? this.parent.pathUrl : '/';

    this.pathUrl = parentPathUrl + name;
    console.log(this.pathUrl);
  }
}
