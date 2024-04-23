import { CreateRootFolderRequestDto, FileType } from '@luetek/common-models';
import fs, { constants } from 'fs';
import path from 'path';
import { Injectable } from '@nestjs/common';
import { RootFolderEntity } from '../entities/root-folder.entity';
import { StorageService } from './storage-service.interface';
import { FolderEntity } from '../entities/folder.entity';
import { FileEntity } from '../entities/file.entity';

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

  public async scan(rootFolder: RootFolderEntity) {
    const outFolders: FolderEntity[] = [];
    const outFiles: FileEntity[] = [];
    const folder = new FolderEntity();
    folder.name = rootFolder.name;
    folder.url = '.';
    folder.parent = null;
    folder.root = rootFolder;

    const folders = [folder];

    while (folders.length > 0) {
      const item = folders.pop();
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
          fileEntity.fileType = FileType.UNKNOWN;
          fileEntity.fileSize = stats.size;
          outFiles.push(fileEntity);
        }
      }
    }
    return { outFiles, outFolders };
  }
}
