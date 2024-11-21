import { IsInt, Length, Max, Min } from 'class-validator';

export class CollectionSection {
  @IsInt()
  @Min(1)
  @Max(9)
  sectionId!: number;

  @Length(8, 16)
  title!: string;
}
