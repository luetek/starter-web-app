import { AutoMap } from '@automapper/classes';
import { FileDto, FolderDto } from '@luetek/common-models';

export class ScanReponseDto {
  @AutoMap(() => [FileDto])
  files!: FileDto[];

  @AutoMap(() => [FolderDto])
  folders!: FolderDto[];
}
