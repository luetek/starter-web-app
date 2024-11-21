import { AutoMap } from '@automapper/classes';
import { FileEntity } from '../../storage/entities/file.entity';

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
}
