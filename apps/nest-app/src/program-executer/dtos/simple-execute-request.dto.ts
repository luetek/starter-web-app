export enum ExecutionEnvironment {
  PYTHON3 = 'PYTHON3',
}

export class SimpleExecuteRequestDto {
  executionEnvironment: ExecutionEnvironment;

  source: string;

  input: string;
}
