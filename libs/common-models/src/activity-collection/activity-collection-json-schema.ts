import { Equals, IsDefined, IsInt, Length, Max, Min, ValidateNested } from 'class-validator';
import { instanceToPlain, plainToInstance } from 'class-transformer';
/**
 * All user specified it like keywords, activityId, or activityCollectionId etc
 * should be 5 to 10 characters long
 */

export class CollectionSectionJsonSchema {
  @IsInt()
  @Min(1)
  @Max(9)
  sectionOrder!: number;

  @Length(8, 16)
  title!: string;

  @Length(4, 16, {
    each: true,
  })
  actvities!: string[];
}

export class ActivityCollectionJsonSchema {
  @Length(4, 32)
  id!: string;

  @Length(4, 64)
  title!: string;

  @Equals('activity-collection')
  type!: 'activity-collection';

  @Length(4, 256)
  descriptionFile!: string;

  @Length(4, 32, {
    each: true,
  })
  keywords!: string[];

  @IsDefined()
  @ValidateNested()
  sections!: CollectionSectionJsonSchema[];

  @Length(4, 32, {
    each: true,
  })
  authors!: string[];
}

export function deserializeActivityCollection(objectStr: string) {
  const object = JSON.parse(objectStr) as ActivityCollectionJsonSchema;
  if (object.type === 'activity-collection') return plainToInstance(ActivityCollectionJsonSchema, object);
  return null;
}

export function serializeActivityCollection(object: ActivityCollectionJsonSchema) {
  return JSON.stringify(instanceToPlain(object));
}
