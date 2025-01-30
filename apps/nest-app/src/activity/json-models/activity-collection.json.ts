import { AutoMap } from '@automapper/classes';
import { CollectionSection } from '@luetek/common-models';

export class ActivityCollectionJson {
  @AutoMap()
  readableId: string;

  @AutoMap()
  title: string;

  @AutoMap()
  description: string;

  @AutoMap(() => [String])
  keywords: string[];

  @AutoMap(() => [String])
  authors: string[];

  @AutoMap(() => [CollectionSection])
  sections: CollectionSection[];
}
