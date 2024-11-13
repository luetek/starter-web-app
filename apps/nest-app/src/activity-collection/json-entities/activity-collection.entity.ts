import { AutoMap } from '@automapper/classes';
import { ActivityCollectionStatus } from '@luetek/common-models';
import { FileEntity } from '../../storage/entities/file.entity';
import { JsonEntity } from '../../storage/entities/json-entity';

export class ActivityCollectionJsonEntity extends JsonEntity {
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
  status: ActivityCollectionStatus;

  serialize(): string {
    throw new Error('Method not implemented.');
  }

  deserialize(): JsonEntity {
    throw new Error('Method not implemented.');
  }
}
