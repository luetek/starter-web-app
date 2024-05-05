import { CreateRootFolderRequestDto, StorageChangeEvent } from '@luetek/common-models';
import { RootFolderEntity } from '../entities/root-folder.entity';
import { FileEntity } from '../entities/file.entity';
import { FolderEntity } from '../entities/folder.entity';

export function calulateFileHash(fileEntity: FileEntity): string {
  return `${fileEntity.checksum}-${fileEntity.fileSize}`;
}

export interface ScanResponse {
  outFiles: FileEntity[];
  outFolders: FolderEntity[];
  changeEvents: StorageChangeEvent[];
}
export interface StorageService {
  createRootFolderEntity(createRequest: CreateRootFolderRequestDto): Promise<RootFolderEntity>;
  scan(rootFolder: RootFolderEntity, folders: FolderEntity[], files: FileEntity[]): Promise<ScanResponse>;
}
