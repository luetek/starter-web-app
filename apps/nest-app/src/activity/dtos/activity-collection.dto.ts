import { AutoMap } from '@automapper/classes';
import { ActivityCollection, CollectionSection } from '@luetek/common-models';

export class ActivityCollectionDto implements ActivityCollection {
  @AutoMap()
  id: number;

  @AutoMap()
  readableId: string;

  @AutoMap()
  title: string;

  @AutoMap()
  description: string;

  // In a given folder there can be only one Collection
  @AutoMap()
  parent: StoragePathDto;

  @AutoMap(() => [ActivityEntity])
  @OneToMany(() => ActivityEntity, (activity) => activity.collection)
  activities: ActivityEntity[];

  @AutoMap()
  keywords: string[];

  @AutoMap()
  authors: string[];

  @AutoMap()
  sections: CollectionSection[];
}
