import { GetObjectCommand, HeadBucketCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import {
  CreateRootFolderRequestDto,
  FileAddedEvent,
  FileDeletedEvent,
  FileModifiedEvent,
  FileRenameEvent,
  FileStatus,
  FileType,
  FolderAddedEvent,
  FolderDeletedEvent,
  FolderStatus,
  StorageChangeEvent,
} from '@luetek/common-models';
import { Inject, Injectable } from '@nestjs/common';
import { ReadableWebToNodeStream } from 'readable-web-to-node-stream';
import { Readable } from 'readable-stream';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { StorageService, calulateFileHash } from './storage-service.interface';
import { RootFolderEntity } from '../entities/root-folder.entity';
import { ReqLogger } from '../../logger/req-logger';
import { FolderEntity } from '../entities/folder.entity';
import { FileEntity } from '../entities/file.entity';

@Injectable()
export class S3Service implements StorageService {
  private client: S3Client;

  constructor(
    @InjectRepository(FileEntity)
    private filesRepository: Repository<FileEntity>,
    @Inject('S3CLIENT') s3Client: S3Client,
    private logger: ReqLogger
  ) {
    this.client = s3Client;
    this.logger.setContext(S3Service.name);
  }

  public async createRootFolderEntity(createRequest: CreateRootFolderRequestDto) {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/command/HeadBucketCommand/
    const headRequest = new HeadBucketCommand({ Bucket: createRequest.folderPath });
    const res = await this.client.send(headRequest);
    this.logger.log(JSON.stringify(res));

    const folder = new RootFolderEntity();
    folder.name = createRequest.folderName;
    folder.url = createRequest.folderPath;
    folder.readOnly = createRequest.readOnly;
    folder.folderType = createRequest.folderType;
    return folder;
  }

  public async scan(rootFolder: RootFolderEntity, folderEntities: FolderEntity[], fileEntities: FileEntity[]) {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/
    const Delimiter = '/';
    const params = { Bucket: rootFolder.url, Prefix: '', Delimiter, parent: null };
    const folders = [params];
    const outFolders: FolderEntity[] = [];
    const outFiles: FileEntity[] = [];
    const changeEvents: StorageChangeEvent[] = [];
    const prefixMap = new Map<string, FolderEntity>();

    const checksumSizeFilesMap = new Map<string, FileEntity>(
      fileEntities.map((fileEntity) => [`${fileEntity.checksum}-${fileEntity.fileSize}`, fileEntity])
    );

    const checksumSet = new Set<string>();

    const urlFolderMap = new Map<string, FolderEntity>(
      folderEntities.map((folderEntity) => [folderEntity.url, folderEntity])
    );

    const urlFilesMap = new Map<string, FileEntity>(fileEntities.map((fileEntity) => [fileEntity.url, fileEntity]));

    while (folders.length > 0) {
      const item = folders.pop();
      // eslint-disable-next-line no-await-in-loop
      const data = await this.client.send(new ListObjectsV2Command(item));
      const folderEntity = new FolderEntity();
      folderEntity.url = item.Prefix;
      folderEntity.root = rootFolder;
      folderEntity.name = item.Prefix.substring(0, item.Prefix.length - 1)
        .split(Delimiter)
        .pop();
      folderEntity.status = FolderStatus.UPTODATE;
      folderEntity.parent = prefixMap.get(item.parent);
      if (urlFolderMap.has(folderEntity.url)) {
        folderEntity.id = urlFolderMap.get(folderEntity.url).id;
        urlFolderMap.delete(folderEntity.url);
      } else {
        changeEvents.push(new FolderAddedEvent(folderEntity));
      }
      outFolders.push(folderEntity);
      prefixMap.set(item.Prefix, folderEntity);
      const subItems = data.CommonPrefixes
        ? data.CommonPrefixes.map((subItem) => {
            return { parent: item.Prefix, Bucket: rootFolder.url, Delimiter: '/', Prefix: subItem.Prefix };
          })
        : [];
      folders.push(...subItems);
      const files = data.Contents.filter((it) => !it.Key.endsWith('/')).map((file) => {
        const fileEntity = new FileEntity();
        fileEntity.parent = folderEntity;
        fileEntity.fileSize = file.Size;
        fileEntity.url = file.Key;
        fileEntity.root = rootFolder;
        fileEntity.updatedAt = file.LastModified;
        fileEntity.createdAt = file.LastModified;
        fileEntity.checksum = file.ETag;
        fileEntity.name = file.Key.split(Delimiter).pop();
        fileEntity.status = checksumSet.has(calulateFileHash(fileEntity)) ? FileStatus.DUPLICATE : FileStatus.UPTODATE;
        checksumSet.add(calulateFileHash(fileEntity));
        // TODO:: Fix this.
        fileEntity.fileType = FileType.UNKNOWN;
        return fileEntity;
      });

      files.forEach((fileEn) => {
        const fileFound = checksumSizeFilesMap.has(calulateFileHash(fileEn));
        if (fileFound) {
          const oldEntity = checksumSizeFilesMap.get(calulateFileHash(fileEn));
          // eslint-disable-next-line no-param-reassign
          fileEn.id = oldEntity.id;
          // if name change then it is a move operation
          if (oldEntity.url !== fileEn.url) {
            changeEvents.push(new FileRenameEvent(oldEntity, fileEn));
          }
          urlFilesMap.delete(oldEntity.url);
        } else if (urlFilesMap.has(fileEn.url)) {
          // Its an update operation
          changeEvents.push(new FileModifiedEvent(fileEn));
          urlFilesMap.delete(fileEn.url);
        } else {
          // Its a  new file add operation
          changeEvents.push(new FileAddedEvent(fileEn));
        }
      });
      outFiles.push(...files);
    }

    // Mark the untouched files/folder for delettion
    urlFilesMap.forEach((fileEn) => {
      // eslint-disable-next-line no-param-reassign
      fileEn.status = FileStatus.DELETED;
      outFiles.push(fileEn);
      changeEvents.push(new FileDeletedEvent(fileEn));
    });

    urlFolderMap.forEach((folderEn) => {
      // eslint-disable-next-line no-param-reassign
      folderEn.status = FolderStatus.DELETED;
      outFolders.push(folderEn);
      changeEvents.push(new FolderDeletedEvent(folderEn));
    });

    this.logger.log(JSON.stringify({ outFiles, outFolders }));
    return { outFiles, outFolders, changeEvents };
  }

  async fetchAsStream(file: FileEntity): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: file.root.url,
      Key: file.url,
    });
    const res = await this.client.send(command);
    return new ReadableWebToNodeStream(res.Body.transformToWebStream());
  }

  async findByRelativeUrl(parentFolderEntity: FolderEntity, relativeFileUrl): Promise<FileEntity> {
    const fileUrl = parentFolderEntity.url + relativeFileUrl;
    return this.filesRepository.findOne({ where: { url: fileUrl, root: parentFolderEntity.root } });
  }
}
