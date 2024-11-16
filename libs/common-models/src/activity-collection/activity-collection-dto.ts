import { AutoMap } from '@automapper/classes';
import { FileDto } from '../storage/storage.dto';
import { ActivityCollectionStatus } from './activity-collection-common';

export class ActivityCollectionDto {
  @AutoMap()
  id!: string;

  @AutoMap()
  title!: string;

  @AutoMap()
  descriptionFile!: FileDto;

  @AutoMap()
  keywords!: string[];

  @AutoMap()
  authors!: string[];

  @AutoMap()
  mappedFile!: FileDto;

  @AutoMap()
  status!: ActivityCollectionStatus;
}
