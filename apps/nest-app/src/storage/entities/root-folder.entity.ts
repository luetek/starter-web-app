import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { FolderType } from '@luetek/common-models';
import { AutoMap } from '@automapper/classes';

@Entity()
export class RootFolderEntity {
  @AutoMap()
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @AutoMap()
  @Column()
  name: string;

  @AutoMap()
  @Column({ unique: true })
  url: string;

  @AutoMap()
  @Column({
    type: 'simple-enum',
    enum: FolderType,
  })
  folderType: FolderType;

  @AutoMap()
  @Column()
  readOnly: boolean;
}
