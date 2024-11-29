import fs from 'fs';
import crypto from 'node:crypto';
import path from 'path';
import { Inject, Injectable, UseInterceptors } from '@nestjs/common';
import { Readable } from 'stream';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoragePathDto, StorageType } from '@luetek/common-models';
import { MapInterceptor } from '@automapper/nestjs';
import { StoragePathEntity } from '../storage-path/entities/storage-path.entity';
import { CreateFolderRequestDto } from './dtos/create-folder-request.dto';
import { FileStreamDto } from './dtos/file-stream-dto';

@Injectable()
export class FileSystemService {
  constructor(
    @InjectRepository(StoragePathEntity)
    private storagePathRepository: Repository<StoragePathEntity>,
    @Inject('ROOT_FS_DIR') private rootDir: string
  ) {}

  private generateChecksumAndWriteToFile(readStream: Readable, filePath: string) {
    const createHash = crypto.createHash('md5');
    const writeStream = fs.createWriteStream(path.join(this.rootDir, filePath));
    return new Promise<string>((resolve, reject) => {
      readStream
        .on('data', (chunk) => createHash.update(chunk))
        .on('end', () => resolve(createHash.digest('hex')))
        .on('error', (err) => reject(err))
        .pipe(writeStream);
    });
  }

  @UseInterceptors(MapInterceptor(StoragePathEntity, StoragePathDto))
  async createDirectory(createFolderRequest: CreateFolderRequestDto): Promise<StoragePathDto> {
    const id = createFolderRequest.parentId;
    const parentEntity = id ? await this.storagePathRepository.findOne({ where: { id } }) : null;
    const parentPath = parentEntity ? parentEntity.pathUrl : '.';
    await fs.promises.mkdir(path.join(this.rootDir, parentPath, createFolderRequest.name), { recursive: true });
    const folderEntity = new StoragePathEntity();
    folderEntity.name = createFolderRequest.name;
    folderEntity.parent = parentEntity;
    folderEntity.storageType = StorageType.FOLDER;
    return this.storagePathRepository.save(folderEntity);
  }

  @UseInterceptors(MapInterceptor(StoragePathEntity, StoragePathDto))
  async upload(file: Express.Multer.File, id: number): Promise<StoragePathDto> {
    const parentEntity = await this.storagePathRepository.findOne({ where: { id } });
    const fileEntity = new StoragePathEntity();
    fileEntity.parent = parentEntity;
    fileEntity.name = file.originalname;
    fileEntity.mimeType = file.mimetype;
    fileEntity.size = file.size;

    const storage = new StoragePathEntity();
    storage.name = file.originalname;
    storage.storageType = StorageType.FILE;
    storage.parent = parentEntity;
    let stream = file.buffer ? Readable.from(file.buffer) : file.stream;
    if (!stream) {
      stream = fs.createReadStream(file.path);
    }
    this.generateChecksumAndWriteToFile(stream, path.join(parentEntity.pathUrl, file.originalname));

    return this.storagePathRepository.save(storage);
  }

  async fetchAsStream(parentId: number, relativeFilePath: string): Promise<FileStreamDto> {
    const parentEntity = await this.storagePathRepository.findOne({ where: { id: parentId } });
    const pathUrl = path.join(parentEntity.pathUrl, relativeFilePath);
    const entity = await this.storagePathRepository.findOne({ where: { pathUrl } });
    return {
      stream: fs.createReadStream(path.join(this.rootDir, entity.pathUrl)),
      mimeType: entity.mimeType,
      name: entity.name,
    };
  }
}
