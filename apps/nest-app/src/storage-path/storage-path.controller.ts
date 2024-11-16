import { Body, Controller, Get, Param, Post, UseInterceptors } from '@nestjs/common';
import { CreateRootFolderRequestDto } from '@luetek/common-models';
import { MapInterceptor } from '@automapper/nestjs';
import { StoragePathService } from './storage-path.service';
import { CreateCollectionDto } from './dtos/create-collection.dto';

@Controller('storage-v2')
export class StorageV2Controller {
  constructor(private storageService: StoragePathService) {}

  @Post()
  async create(@Body() createRequest: CreateCollectionDto) {
    return this.storageService.create(createRequest);
  }

  @Get()
  async findAll() {
    return this.storageService.findAll();
  }
}
