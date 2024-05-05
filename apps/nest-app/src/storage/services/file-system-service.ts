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
  StorageChangeEvent,
} from '@luetek/common-models';
import fs, { constants } from 'fs';
import path from 'path';
import { Injectable } from '@nestjs/common';
import crypto from 'node:crypto';
import { RootFolderEntity } from '../entities/root-folder.entity';
import { StorageService, calulateFileHash } from './storage-service.interface';
import { FolderEntity } from '../entities/folder.entity';
import { FileEntity } from '../entities/file.entity';

function generateChecksum(readStream: fs.ReadStream) {
  const createHash = crypto.createHash('md5');

  return new Promise<string>((resolve) => {
    readStream
      .on('data', (chunk) => createHash.update(chunk))
      .on('end', () => {
        resolve(createHash.digest('hex'));
      });
  });
}

@Injectable()
export class FileSystemService implements StorageService {
  public async createRootFolderEntity(createRequest: CreateRootFolderRequestDto) {
    const pathNormalized = path.normalize(createRequest.folderPath);
    await fs.promises.access(pathNormalized, constants.R_OK);
    const fStat = await fs.promises.lstat(pathNormalized);
    if (!fStat.isDirectory()) throw new Error(`${pathNormalized} is not a directory`);

    const folder = new RootFolderEntity();
    folder.name = createRequest.folderName;
    folder.url = pathNormalized;
    folder.readOnly = createRequest.readOnly;
    folder.folderType = createRequest.folderType;
    return folder;
  }

  public async scan(rootFolder: RootFolderEntity, folderEntities: FolderEntity[], fileEntities: FileEntity[]) {
    const outFolders: FolderEntity[] = [];
    const outFiles: FileEntity[] = [];
    const changeEvents: StorageChangeEvent[] = [];
    const folder = new FolderEntity();
    folder.name = rootFolder.name;
    folder.url = '.';
    folder.parent = null;
    folder.root = rootFolder;

    const checksumSizeFilesMap = new Map<string, FileEntity>(
      fileEntities.map((fileEntity) => [`${fileEntity.checksum}-${fileEntity.fileSize}`, fileEntity])
    );

    const checksumSet = new Set<string>();

    const urlFolderMap = new Map<string, FolderEntity>(
      folderEntities.map((folderEntity) => [folderEntity.url, folderEntity])
    );

    const urlFilesMap = new Map<string, FileEntity>(fileEntities.map((fileEntity) => [fileEntity.url, fileEntity]));

    const folders = [folder];

    while (folders.length > 0) {
      const item = folders.pop();
      const folderFound = urlFolderMap.has(item.url);
      if (folderFound) {
        item.id = urlFolderMap.get(item.url).id;
        urlFolderMap.delete(item.url);
      } else {
        changeEvents.push(new FolderAddedEvent(item));
      }
      // eslint-disable-next-line no-await-in-loop
      const subItems = await fs.promises.readdir(path.join(rootFolder.url, item.url));
      outFolders.push(item);

      for (let i = 0; i < subItems.length; i += 1) {
        const newFile = subItems[i];
        const fullPathNewFile = path.join(rootFolder.url, item.url, newFile);
        // eslint-disable-next-line no-await-in-loop
        const stats = await fs.promises.stat(fullPathNewFile);

        if (stats.isDirectory()) {
          const subFolder = new FolderEntity();
          subFolder.name = newFile;
          subFolder.url = path.join(item.url, newFile);
          subFolder.parent = item;
          subFolder.root = rootFolder;
          folders.push(subFolder);
        } else {
          const fileEntity = new FileEntity();
          fileEntity.name = newFile;
          fileEntity.parent = item;
          fileEntity.url = path.join(item.url, newFile);
          fileEntity.root = rootFolder;
          const fileReadStream = fs.createReadStream(path.join(rootFolder.url, fileEntity.url));
          // eslint-disable-next-line no-await-in-loop
          fileEntity.checksum = await generateChecksum(fileReadStream);
          fileEntity.status = checksumSet.has(calulateFileHash(fileEntity))
            ? FileStatus.DUPLICATE
            : FileStatus.UPTODATE;
          checksumSet.add(calulateFileHash(fileEntity));
          // TODO:: Fix this.
          fileEntity.fileType = FileType.UNKNOWN;
          fileEntity.fileSize = stats.size;
          fileEntity.updatedAt = stats.mtime;
          fileEntity.createdAt = stats.ctime;

          const fileFound = checksumSizeFilesMap.has(calulateFileHash(fileEntity));
          if (fileFound) {
            const oldEntity = checksumSizeFilesMap.get(calulateFileHash(fileEntity));
            fileEntity.id = oldEntity.id;
            // if name change then it is a move operation
            if (oldEntity.url !== fileEntity.url) {
              changeEvents.push(new FileRenameEvent(oldEntity, fileEntity));
            }
            urlFilesMap.delete(oldEntity.url);
          } else if (urlFilesMap.has(fileEntity.url)) {
            // Its an update operation
            changeEvents.push(new FileModifiedEvent(fileEntity));
            urlFilesMap.delete(fileEntity.url);
          } else {
            // Its a  new file add operation
            changeEvents.push(new FileAddedEvent(fileEntity));
          }
          outFiles.push(fileEntity);
        }
      }
    }

    // Mark the untouched files/folder for delettion
    checksumSizeFilesMap.forEach((fileEn) => {
      // eslint-disable-next-line no-param-reassign
      fileEn.status = FileStatus.DELETED;
      outFiles.push(fileEn);
      changeEvents.push(new FileDeletedEvent(fileEn));
    });

    urlFolderMap.forEach((folderEn) => {
      outFolders.push(folderEn);
      changeEvents.push(new FolderDeletedEvent(folderEn));
    });
    return { outFiles, outFolders, changeEvents };
  }
}
