import { AutoMap } from '@automapper/classes';
import { StoragePath, StorageType } from './common.interface';
import { PaginationMeta } from '../paginate/paginate.dto';

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
  @AutoMap(() => [StoragePathDto])
  children: StoragePathDto[];

  // Optional
  parent: StoragePathDto;
}

export class PaginatedStoragePathDto {
  @AutoMap(() => [StoragePathDto])
  data!: StoragePathDto[];

  @AutoMap(() => PaginationMeta)
  meta!: PaginationMeta;
}
