import { AutoMap } from '@automapper/classes';
import { FileDto, FolderDto } from '@luetek/common-models';

export class RootFolderDetailReponseDto {
  @AutoMap(() => [FileDto])
  files!: FileDto[];

  @AutoMap(() => [FolderDto])
  folders!: FolderDto[];
}
