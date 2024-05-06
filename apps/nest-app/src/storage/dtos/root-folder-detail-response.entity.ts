import { AutoMap } from '@automapper/classes';
import { FileEntity } from '../entities/file.entity';
import { FolderEntity } from '../entities/folder.entity';

export class RootFolderDetailReponseEntity {
  @AutoMap(() => [FileEntity])
  files!: FileEntity[];

  @AutoMap(() => [FolderEntity])
  folders!: FolderEntity[];
}
