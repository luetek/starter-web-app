import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { PaginatedStoragePathDto, StoragePathDto } from '@luetek/common-models';
import { StoragePathService } from './storage-path.service';
import { CreateFolderRequestDto } from './dtos/create-folder-request.dto';

@Controller('storage-paths')
export class StoragePathController {
  constructor(private storageService: StoragePathService) {}

  @Post('folders')
  async createFolder(@Body() createRequest: CreateFolderRequestDto) {
    return this.storageService.createFolder(createRequest);
  }

  @Get()
  async findAll(@Paginate() query: PaginateQuery): Promise<PaginatedStoragePathDto> {
    return this.storageService.findAll(query);
  }

  @Get(':id/tree-details')
  async findOne(@Param('id') id: number): Promise<StoragePathDto> {
    return this.storageService.findDetails(id);
  }
}
