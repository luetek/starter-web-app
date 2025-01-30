export enum ExecutionEnvironment {
  PYTHON3 = 'PYTHON3',
}

export class SimpleExecuteRequestDto {
  environment: ExecutionEnvironment;

  mainFile: string;
}
