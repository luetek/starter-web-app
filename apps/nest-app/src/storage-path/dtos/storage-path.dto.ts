import { AutoMap } from '@automapper/classes';
import { StoragePath, StorageType } from '@luetek/common-models';

export class StoragePathDto implements StoragePath {
  @AutoMap()
  id: number;

  @AutoMap()
  name: string;

  @AutoMap()
  readonly pathUrl: string;

  @AutoMap()
  parentId: number;

  @AutoMap()
  storageType: StorageType;

  @AutoMap()
  children: StoragePathDto[];
}
