import { ExecutionEnvironment } from './common';

export class SimpleExecuteRequestDto {
  environment!: ExecutionEnvironment;

  mainFile!: string;
}
