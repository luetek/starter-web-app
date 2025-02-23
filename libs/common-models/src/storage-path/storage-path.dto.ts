import { AutoMap } from '@automapper/classes';
import { StoragePath, StorageType } from './common.interface';
import { PaginationMeta } from '../paginate/paginate.dto';

export class StoragePathDto implements StoragePath {
  @AutoMap()
  id!: number;

  @AutoMap()
  name!: string;

  @AutoMap()
  readonly pathUrl!: string;

  @AutoMap()
  parentId!: number;

  @AutoMap()
  storageType!: StorageType;

  // Optional
  @AutoMap(() => [StoragePathDto])
  children?: StoragePathDto[];

  // Optional
  parent?: StoragePathDto;

  @AutoMap()
  version!: number;

  @AutoMap(() => Date)
  createdAt!: Date;

  @AutoMap(() => Date)
  updatedAt!: Date;
}

export class PaginatedStoragePathDto {
  @AutoMap(() => [StoragePathDto])
  data!: StoragePathDto[];

  @AutoMap(() => PaginationMeta)
  meta!: PaginationMeta;
}
