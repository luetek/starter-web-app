import { Entity, JoinColumn, OneToOne } from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { FileEntity } from './file.entity';
import { FolderEntity } from './folder.entity';

@Entity()
export abstract class JsonEntity {
  @AutoMap()
  @OneToOne(() => FileEntity)
  @JoinColumn()
  mappedFile: FileEntity;

  getFolderEntity(): FolderEntity | null {
    return this.mappedFile ? this.mappedFile.parent : null;
  }

  abstract serialize(): string;

  abstract deserialize(): JsonEntity;
}
