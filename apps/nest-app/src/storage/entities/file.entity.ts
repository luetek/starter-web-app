import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IFile, FileType, FileStatus } from '@luetek/common-models';
import { AutoMap } from '@automapper/classes';
import { FolderEntity } from './folder.entity';
import { RootFolderEntity } from './root-folder.entity';

@Entity()
export class FileEntity implements IFile {
  @AutoMap()
  @PrimaryGeneratedColumn()
  id: number;

  @AutoMap()
  @Column({ type: 'integer' })
  parentId: number;

  @ManyToOne(() => FolderEntity)
  @JoinColumn()
  parent: FolderEntity;

  @ManyToOne(() => RootFolderEntity)
  @JoinColumn()
  root: RootFolderEntity;

  @AutoMap()
  @Column()
  name: string;

  @AutoMap()
  @Column()
  url: string;

  @AutoMap()
  @Column({
    type: 'simple-enum',
    enum: FileType,
  })
  fileType: FileType;

  @AutoMap()
  @Column()
  fileSize: number;

  @AutoMap()
  @Column()
  checksum: string;

  @AutoMap()
  @CreateDateColumn()
  createdAt: Date; // Creation date

  @AutoMap()
  @UpdateDateColumn()
  updatedAt: Date; // Last updated date

  status: FileStatus;
}
