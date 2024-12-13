import { AutoMap } from '@automapper/classes';
import { Length } from 'class-validator';

export class CollectionSection {
  @AutoMap()
  sectionId!: string;

  @AutoMap()
  @Length(8, 16)
  title!: string;

  @AutoMap()
  default!: boolean;

  // We are not using set as it is not ordered container.
  @AutoMap()
  orderedActivities!: number[]; // Set of activityId list ordered
}
