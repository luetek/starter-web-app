import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateFolderRequestDto, StoragePathDto } from '@luetek/common-models';
import { Express } from 'express';
import { ReqLogger } from '../logger/req-logger';
import { FileSystemService } from './file-system.service';

// https://stackoverflow.com/questions/59097119/using-multer-diskstorage-with-typescript
import 'multer';

@Controller('storage')
export class FileSystemController {
  constructor(
    private readonly fileSystemService: FileSystemService,
    private logger: ReqLogger
  ) {
    logger.setContext(FileSystemController.name);
  }

  @Post('folder')
  async createFolder(@Body() createRequest: CreateFolderRequestDto) {
    return this.fileSystemService.createDirectory(createRequest);
  }

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Param('id') id: number, @UploadedFile() file: Express.Multer.File): Promise<StoragePathDto> {
    return this.fileSystemService.upload(file, id);
  }

  @Delete(':id')
  @UseInterceptors(FileInterceptor('file'))
  async deleteFile(@Param('id') id: number): Promise<string> {
    return this.fileSystemService.deleteFile(id);
  }

  @Put(':id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async updateFileContent(
    @Param('id', ParseIntPipe) fileId: number,
    @UploadedFile() file: Express.Multer.File
  ): Promise<StoragePathDto> {
    return this.fileSystemService.updateFileContent(file, fileId);
  }

  @Get(':id/stream/:filePath')
  async getFile(
    @Param('id') parentId: number,
    @Param('filePath') relativePathFromParent: string
  ): Promise<StreamableFile> {
    const fileStreamDto = await this.fileSystemService.fetchAsStream(parentId, relativePathFromParent);
    const fileName = fileStreamDto.name;
    return new StreamableFile(fileStreamDto.stream, {
      type: fileStreamDto.mimeType,
      disposition: `attachment; filename="${fileName}"`,
    });
  }
}
