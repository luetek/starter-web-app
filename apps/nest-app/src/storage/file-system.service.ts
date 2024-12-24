import fs from 'fs';
import crypto from 'node:crypto';
import path from 'path';
import { Inject, Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFolderRequestDto, StoragePathDto, StorageType } from '@luetek/common-models';
import { InjectMapper } from '@automapper/nestjs';
import { pipeline } from 'node:stream/promises';
import { instanceToPlain } from 'class-transformer';
import { Mapper } from '@automapper/core';
import { StoragePathEntity } from '../storage-path/entities/storage-path.entity';
import { FileStreamDto } from './dtos/file-stream-dto';

@Injectable()
export class FileSystemService {
  constructor(
    @InjectMapper() private mapper: Mapper,
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

  async createDirectory(createFolderRequest: CreateFolderRequestDto): Promise<StoragePathDto> {
    const id = createFolderRequest.parentId;
    const parentEntity = await this.storagePathRepository.findOneOrFail({ where: { id } });
    const parentPath = parentEntity.pathUrl;
    await fs.promises.mkdir(path.join(this.rootDir, parentPath, createFolderRequest.name), { recursive: true });
    const folderEntity = new StoragePathEntity();
    folderEntity.name = createFolderRequest.name;
    folderEntity.parent = parentEntity;
    folderEntity.storageType = StorageType.FOLDER;
    const existing = await this.storagePathRepository.findOne({
      where: { parent: parentEntity, name: createFolderRequest.name },
    });
    if (existing) {
      return this.mapper.map(existing, StoragePathEntity, StoragePathDto);
    }
    const res = await this.storagePathRepository.save(folderEntity);
    return this.mapper.map(res, StoragePathEntity, StoragePathDto);
  }

  async createRootDirectory(name: string): Promise<StoragePathDto> {
    await fs.promises.mkdir(path.join(this.rootDir, name), { recursive: true });
    const folderEntity = new StoragePathEntity();
    folderEntity.name = name;
    folderEntity.parent = null;
    folderEntity.storageType = StorageType.FOLDER;
    const existing = await this.storagePathRepository.findOne({
      where: { parent: null, name },
    });
    if (existing) {
      return this.mapper.map(existing, StoragePathEntity, StoragePathDto);
    }
    const res = await this.storagePathRepository.save(folderEntity);
    return this.mapper.map(res, StoragePathEntity, StoragePathDto);
  }

  async upload(file: Express.Multer.File, id: number): Promise<StoragePathDto> {
    console.log(file);

    const parentEntity = await this.storagePathRepository.findOne({ where: { id } });
    const storage = new StoragePathEntity();
    storage.name = file.originalname;
    storage.storageType = StorageType.FILE;
    storage.mimeType = file.mimetype;
    storage.size = file.size;
    storage.parent = parentEntity;
    let stream = file.buffer ? Readable.from(file.buffer) : file.stream;
    if (!stream) {
      stream = fs.createReadStream(file.path);
    }
    this.generateChecksumAndWriteToFile(stream, path.join(parentEntity.pathUrl, file.originalname));

    const res = await this.storagePathRepository.save(storage);
    return this.mapper.map(res, StoragePathEntity, StoragePathDto);
  }

  async updateFileContent(file: Express.Multer.File, id: number) {
    console.log(file);

    const storage = await this.storagePathRepository.findOne({ where: { id } });
    storage.mimeType = file.mimetype;
    storage.size = file.size;
    let stream = file.buffer ? Readable.from(file.buffer) : file.stream;
    if (!stream) {
      stream = fs.createReadStream(file.path);
    }
    this.generateChecksumAndWriteToFile(stream, storage.pathUrl);

    const res = await this.storagePathRepository.save(storage);
    return this.mapper.map(res, StoragePathEntity, StoragePathDto);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async saveAsJson(parentFolderId: number, fileName: string, JsonOvj: any): Promise<StoragePathDto> {
    const parentEntity = await this.storagePathRepository.findOneOrFail({ where: { id: parentFolderId } });
    const fileEntitySaved = await this.storagePathRepository.findOne({
      where: { name: fileName, parentId: parentFolderId },
    });
    const fileEntity = fileEntitySaved || new StoragePathEntity();
    fileEntity.parent = parentEntity;
    fileEntity.name = fileName;
    fileEntity.mimeType = 'application/json';
    fileEntity.storageType = StorageType.FILE;
    const str = JSON.stringify(instanceToPlain(JsonOvj), null, 4);
    fileEntity.size = str.length;
    const pathUrl = path.join(parentEntity.pathUrl, fileName);
    const stream = fs.createWriteStream(path.join(this.rootDir, pathUrl), { encoding: 'utf-8' });
    await pipeline(Readable.from(str), stream);
    const res = await this.storagePathRepository.save(fileEntity);
    return this.mapper.map(res, StoragePathEntity, StoragePathDto);
  }
}
