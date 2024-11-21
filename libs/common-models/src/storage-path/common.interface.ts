export enum StorageType {
  FOLDER = 'FOLDER',
  FILE = 'FILE',
}

export interface StoragePath {
  id: number;

  name: string;

  pathUrl: string;

  parentId: number;

  storageType: StorageType;
}
