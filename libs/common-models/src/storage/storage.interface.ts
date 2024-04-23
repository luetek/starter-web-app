export enum FileType {
  JSON,
  MD,
  MDX,
  UNKNOWN,
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
