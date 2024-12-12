import { AutoMap } from '@automapper/classes';
import { IsInt, Length, Max, Min } from 'class-validator';

export class OrderedActivity {
  @AutoMap()
  @IsInt()
  @Min(1)
  @Max(15)
  orderId!: number;

  @AutoMap()
  @IsInt()
  activityId!: number;
}

export class CollectionSection {
  @AutoMap()
  @IsInt()
  @Min(1)
  @Max(15)
  sectionId!: number;

  @AutoMap()
  @Length(8, 16)
  title!: string;

  @AutoMap()
  default!: boolean;

  @AutoMap()
  orderedActivities!: OrderedActivity[];
}
