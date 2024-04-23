import { CreateRootFolderRequestDto } from '@luetek/common-models';
import { RootFolderEntity } from '../entities/root-folder.entity';
import { FileEntity } from '../entities/file.entity';
import { FolderEntity } from '../entities/folder.entity';

export interface ScanResponse {
  outFiles: FileEntity[];
  outFolders: FolderEntity[];
}
export interface StorageService {
  createRootFolderEntity(createRequest: CreateRootFolderRequestDto): Promise<RootFolderEntity>;
  scan(rootFolder: RootFolderEntity): Promise<ScanResponse>;
}
