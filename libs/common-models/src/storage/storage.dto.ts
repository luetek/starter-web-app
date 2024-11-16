import { IsNotEmpty } from 'class-validator';
import { AutoMap } from '@automapper/classes';
import { FileStatus, FileType, Folder, FolderStatus, FolderType, IFile } from './storage.interface';

export class CreateRootFolderRequestDto {
  @IsNotEmpty()
  folderPath!: string;

  @IsNotEmpty()
  folderName!: string;

  folderType!: FolderType;

  readOnly!: boolean;
}

export class FolderDto implements Folder {
  @AutoMap()
  id!: number;

  @AutoMap()
  name!: string;

  @AutoMap()
  url!: string;

  @AutoMap()
  parentId!: number;

  @AutoMap(() => String)
  status!: FolderStatus;
}

export class FileDto implements IFile {
  @AutoMap()
  fileType!: FileType;

  @AutoMap()
  id!: number;

  @AutoMap()
  name!: string;

  @AutoMap()
  url!: string;

  @AutoMap()
  parentId!: number;

  @AutoMap()
  parent!: FolderDto;

  @AutoMap(() => String)
  status!: FileStatus;
}
