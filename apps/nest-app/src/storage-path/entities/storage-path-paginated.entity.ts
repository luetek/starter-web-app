import { AutoMap } from '@automapper/classes';
import { PaginationMeta } from '@luetek/common-models';
import { StoragePathEntity } from './storage-path.entity';

export class PaginatedStoragePathEntity {
  @AutoMap(() => [StoragePathEntity])
  data: StoragePathEntity[];

  @AutoMap(() => PaginationMeta)
  meta: PaginationMeta;
}
