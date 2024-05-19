import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { FolderType } from '@luetek/common-models';

@Entity()
export class RootFolderEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  url: string;

  @Column({
    type: 'simple-enum',
    enum: FolderType,
  })
  folderType: FolderType;

  @Column()
  readOnly: boolean;
}
