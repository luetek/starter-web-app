import { CreateRootFolderRequestDto, StorageChangeEvent } from '@luetek/common-models';
import { Readable } from 'readable-stream';
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
/**
 * We will support different type of storage services file-system, s3, github etc.
 */
export interface StorageService {
  createRootFolderEntity(createRequest: CreateRootFolderRequestDto): Promise<RootFolderEntity>;
  scan(rootFolder: RootFolderEntity, folders: FolderEntity[], files: FileEntity[]): Promise<ScanResponse>;
  fetchAsStream(file: FileEntity): Promise<Readable>;
  findByRelativeUrl(parentFolderEntity: FolderEntity, relativeFileUrl): Promise<FileEntity>;
}
