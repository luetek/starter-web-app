import { AutoMap } from '@automapper/classes';

export class PaginationMeta {
  @AutoMap()
  itemsPerPage!: number;

  @AutoMap()
  totalItems!: number;

  @AutoMap()
  currentPage!: number;

  @AutoMap()
  totalPages!: number;
}
