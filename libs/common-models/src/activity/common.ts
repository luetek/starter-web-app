import { AutoMap } from '@automapper/classes';
import { IsInt, Length, Max, Min } from 'class-validator';

export class CollectionSection {
  @AutoMap()
  @IsInt()
  @Min(1)
  @Max(9)
  sectionId!: number;

  @AutoMap()
  @Length(8, 16)
  title!: string;
}
