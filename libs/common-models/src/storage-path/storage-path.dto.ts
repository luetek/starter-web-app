import { AutoMap } from '@automapper/classes';
import { StoragePath, StorageType } from './common.interface';

export class StoragePathDto implements StoragePath {
  @AutoMap()
  id!: number;

  @AutoMap()
  name: string;

  @AutoMap()
  pathUrl: string;

  @AutoMap()
  parentId: number;

  @AutoMap()
  storageType: StorageType;

  // Optional
  @AutoMap()
  children: StoragePathDto[];

  // Optional
  @AutoMap()
  parent: StoragePathDto;
}
