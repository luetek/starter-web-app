import { HeadBucketCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { CreateRootFolderRequestDto, FileType } from '@luetek/common-models';
import { Inject, Injectable } from '@nestjs/common';
import { StorageService } from './storage-service.interface';
import { RootFolderEntity } from '../entities/root-folder.entity';
import { ReqLogger } from '../../logger/req-logger';
import { FolderEntity } from '../entities/folder.entity';
import { FileEntity } from '../entities/file.entity';

@Injectable()
export class S3Service implements StorageService {
  private client: S3Client;

  constructor(
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

  public async scan(rootFolder: RootFolderEntity) {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/
    const Delimiter = '/';
    const params = { Bucket: rootFolder.url, Prefix: '', Delimiter, parent: null };
    const folders = [params];
    const outFolders: FolderEntity[] = [];
    const outFiles: FileEntity[] = [];
    const prefixMap = new Map<string, FolderEntity>();
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
      folderEntity.parent = prefixMap.get(item.parent);
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
        fileEntity.name = file.Key.split(Delimiter).pop();
        fileEntity.fileType = FileType.UNKNOWN;
        return fileEntity;
      });

      outFiles.push(...files);
    }

    this.logger.log(JSON.stringify({ outFiles, outFolders }));
    return { outFiles, outFolders };
  }
}
