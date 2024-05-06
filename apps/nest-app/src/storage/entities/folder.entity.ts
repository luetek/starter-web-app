import { Folder, FolderStatus } from '@luetek/common-models';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { RootFolderEntity } from './root-folder.entity';

@Entity()
export class FolderEntity implements Folder {
  @AutoMap()
  @PrimaryGeneratedColumn()
  id: number;

  @AutoMap()
  @Column()
  name: string;

  @AutoMap()
  @Column({ unique: true })
  url: string;

  @AutoMap()
  @Column({ type: 'integer', nullable: true })
  parentId: number;

  @OneToMany(() => FolderEntity, (f) => f.parent, { nullable: true })
  children: FolderEntity[];

  @ManyToOne(() => FolderEntity, (f) => f.children)
  @JoinColumn()
  parent: FolderEntity;

  @AutoMap()
  @Column({ type: 'integer' })
  rootId: number;

  @ManyToOne(() => RootFolderEntity)
  @JoinColumn()
  root: RootFolderEntity;

  @AutoMap()
  @CreateDateColumn()
  createdAt: Date; // Creation date

  @AutoMap()
  @UpdateDateColumn()
  updatedAt: Date; // Last updated date

  @AutoMap()
  @Column({ type: 'simple-enum' })
  status: FolderStatus;

  toString(): string {
    return `id=${this.id}, url=${this.url} root=${this.rootId} parent=${this.parentId} status=${this.status}`;
  }
}
