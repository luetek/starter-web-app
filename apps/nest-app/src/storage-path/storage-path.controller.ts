import { Body, Controller, Get, Post } from '@nestjs/common';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { PaginatedStoragePathDto } from '@luetek/common-models';
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
}
