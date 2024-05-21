import { Body, Controller, Get, Param, Post, UseInterceptors } from '@nestjs/common';
import { CreateRootFolderRequestDto, RootFolderDetailReponseDto, RootFolderDto } from '@luetek/common-models';
import { MapInterceptor } from '@automapper/nestjs';
import { FolderService } from './folder.service';
import { RootFolderDetailReponseEntity } from './dtos/root-folder-detail-response.entity';
import { RootFolderEntity } from './entities/root-folder.entity';

@Controller('folders')
export class FolderController {
  constructor(private folderService: FolderService) {}

  @Post()
  async create(@Body() createRequest: CreateRootFolderRequestDto) {
    return this.folderService.create(createRequest);
  }

  @UseInterceptors(MapInterceptor(RootFolderEntity, RootFolderDto, { isArray: true }))
  @Get()
  async findAll() {
    return this.folderService.findAll();
  }

  @UseInterceptors(MapInterceptor(RootFolderDetailReponseEntity, RootFolderDetailReponseDto))
  @Get(':id')
  async findOneSubfolders(@Param('id') id: number) {
    return this.folderService.findOne(id);
  }

  @UseInterceptors(MapInterceptor(RootFolderDetailReponseEntity, RootFolderDetailReponseDto))
  @Get(':id/scan')
  async scan(@Param('id') id: number) {
    return this.folderService.scan(id);
  }
}
