import { AutoMap } from '@automapper/classes';
import { FileEntity } from '../../storage/entities/file.entity';

export enum ActivityCollectionJsonEntityStatus {
  ACTIVE = 'ACTIVE',
  MISSING = 'MISSING',
  DRAFT = 'DRAFT',
}

export class ActivityCollectionJsonEntity {
  @AutoMap()
  id: string;

  @AutoMap()
  title: string;

  @AutoMap()
  descriptionFile: FileEntity;

  @AutoMap()
  keywords: string[];

  @AutoMap()
  authors: string[];

  @AutoMap()
  mappedFile: FileEntity;

  @AutoMap()
  status: ActivityCollectionJsonEntityStatus;
}
