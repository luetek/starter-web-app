import { Body, Controller, Get, Param, Post, UseInterceptors } from '@nestjs/common';
import { CreateRootFolderRequestDto } from '@luetek/common-models';
import { MapInterceptor } from '@automapper/nestjs';
import { StoragePathService } from './storage-path.service';
import { CreateFolderRequestDto } from './dtos/create-folder-request.dto';

@Controller('storage-v2')
export class StorageV2Controller {
  constructor(private storageService: StoragePathService) {}

  @Post('folders')
  async createFolder(@Body() createRequest: CreateFolderRequestDto) {
    return this.storageService.createFolder(createRequest);
  }

  @Get()
  async findAll() {
    return this.storageService.findAll();
  }
}
