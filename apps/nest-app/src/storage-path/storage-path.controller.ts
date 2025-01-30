import { Controller, Get, Param } from '@nestjs/common';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { PaginatedStoragePathDto, StoragePathDto } from '@luetek/common-models';
import { StoragePathService } from './storage-path.service';

@Controller('storage-paths')
export class StoragePathController {
  constructor(private storageService: StoragePathService) {}

  @Get()
  async findAll(@Paginate() query: PaginateQuery): Promise<PaginatedStoragePathDto> {
    return this.storageService.findAll(query);
  }

  @Get(':id/tree-details')
  async findOne(@Param('id') id: number): Promise<StoragePathDto> {
    return this.storageService.findDetails(id);
  }
}
