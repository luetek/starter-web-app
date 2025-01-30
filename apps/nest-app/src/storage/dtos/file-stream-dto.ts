import { Readable } from 'stream';

export class FileStreamDto {
  stream!: Readable;

  mimeType!: string;

  name!: string;
}
