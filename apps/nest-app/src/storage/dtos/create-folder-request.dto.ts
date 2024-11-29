/**
 * As long as we have permission to create folder/files in parent folder we should be good to go.
 */

export class CreateFolderRequestDto {
  parentId: number;

  name: string;
}
