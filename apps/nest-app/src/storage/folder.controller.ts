import { Body, Controller, Get, Param, Post, UseInterceptors } from '@nestjs/common';
import { CreateRootFolderRequestDto } from '@luetek/common-models';
import { MapInterceptor } from '@automapper/nestjs';
import { FolderService } from './folder.service';
import { ScanReponseEntity } from './dtos/scan-response.entity';
import { ScanReponseDto } from './dtos/scan-response.dto';

@Controller('folders')
export class FolderController {
  constructor(private folderService: FolderService) {}

  @Post()
  async create(@Body() createRequest: CreateRootFolderRequestDto) {
    return this.folderService.create(createRequest);
  }

  @Get()
  async findAll() {
    return this.folderService.findAll();
  }

  @UseInterceptors(MapInterceptor(ScanReponseEntity, ScanReponseDto))
  @Get('scan/:id')
  async scan(@Param('id') id: number) {
    return this.folderService.scan(id);
  }
}
