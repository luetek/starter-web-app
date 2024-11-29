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
import { StoragePath, StorageType } from '@luetek/common-models';
import { Length, Matches } from 'class-validator';

/**
 * Tree materialiazed-path did not support inheritance properly.
 * Let assume admin create the folder as he feels fit.
 * Inside the folder he she will create file which will be stored both in DB as well as file.
 * for backup purposes.
 *
 */
@Entity()
@Index('file_path_unique', ['name', 'parentId'], { unique: true })
@Tree('materialized-path')
export class StoragePathEntity implements StoragePath {
  @PrimaryGeneratedColumn()
  id: number;

  @Matches(/([a-z]|[0-9][.][-])+/)
  @Length(4, 32)
  @Column()
  name: string;

  @Column({ nullable: true })
  size: number;

  @Column({ nullable: true })
  mimeType: string;

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
  }
}
