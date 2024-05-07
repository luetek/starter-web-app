export enum FileType {
  JSON,
  MD,
  MDX,
  UNKNOWN,
}

export enum FileStatus {
  DELETED = 'DELETED',
  DUPLICATE = 'DUPLICATE',
  UPTODATE = 'UPTODATE',
}

export enum FolderStatus {
  DELETED = 'DELETED',
  UPTODATE = 'UPTODATE',
}
export enum FolderType {
  FILE_SYSTEM = 'FILE_SYSTEM',
  S3 = 'S3',
}

export interface Folder {
  id: number;
  name: string;
  parentId: number;
}

export interface IFile {
  id: number;

  parentId: number;

  name: string;

  url: string;

  fileType: FileType;
}

export enum StorageEventType {
  FILE_RENAME = 'FILE_RENAME',
  FILE_MODIFIED = 'FILE_MODIFIED',
  FILE_ADDED = 'FILE_ADDED',
  FILE_DELETED = 'FILE_DELETED',
  FOLDER_ADDED = 'FOLDER_ADDED',
  FOLDER_DELETED = 'FOLDER_DELETED',
}
export interface StorageChangeEvent {
  type: StorageEventType;
}

export class FileRenameEvent implements StorageChangeEvent {
  constructor(
    readonly old: IFile,
    readonly file: IFile,
    readonly type = StorageEventType.FILE_RENAME
  ) {}
}

export class FileModifiedEvent implements StorageChangeEvent {
  constructor(
    readonly file: IFile,
    readonly type = StorageEventType.FILE_MODIFIED
  ) {}
}

export class FileAddedEvent implements StorageChangeEvent {
  constructor(
    readonly file: IFile,
    readonly type = StorageEventType.FILE_ADDED
  ) {}
}

export class FileDeletedEvent implements StorageChangeEvent {
  constructor(
    readonly file: IFile,
    readonly type = StorageEventType.FILE_DELETED
  ) {}
}

export class FolderAddedEvent implements StorageChangeEvent {
  constructor(
    readonly folder: Folder,
    readonly type = StorageEventType.FOLDER_ADDED
  ) {}
}

export class FolderDeletedEvent implements StorageChangeEvent {
  constructor(
    readonly folder: Folder,
    readonly type = StorageEventType.FOLDER_DELETED
  ) {}
}

export interface StorageChangeHandler {
  handleChange(event: StorageChangeEvent);
}
