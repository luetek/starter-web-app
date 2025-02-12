// eslint-disable-next-line max-classes-per-file
export class ExecutionOutput {
  outputFile?: string;

  inputFile?: string;

  errorFile?: string;

  returnCode!: number;
}

export class SimpleExecuteResponseDto {
  workspaceName?: string;

  workspaceDir?: string;

  outputs?: ExecutionOutput[];
}
