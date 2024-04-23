import { Column, Entity, PrimaryColumn } from 'typeorm';
import { FolderType } from '@luetek/common-models';

@Entity()
export class RootFolderEntity {
  @PrimaryColumn({ name: 'id' })
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
