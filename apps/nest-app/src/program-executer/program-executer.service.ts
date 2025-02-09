/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { randomUUID } from 'crypto';
import util from 'util';
import { exec } from 'child_process';
import { StreamableFile } from '@nestjs/common';
import { ExecutionEnvironment } from './dtos/simple-execute-request.dto';
import { ExecutionOutput, SimpleExecuteResponseDto } from './dtos/simple-execute-response.dto';

const execute = util.promisify(exec);

function writeToFile(readStream: Readable, filePath: string) {
  const writeStream = fs.createWriteStream(filePath);
  return new Promise<void>((resolve, reject) => {
    readStream
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .pipe(writeStream);
  });
}

/**
 * TODO:: We want to do this async. We submit a task. then the task eventually get picked up.
 * and the response is updated and stored in task. After a given time is elapsed the data is deleted.
 *
 * This will ensure low latency for the api. The drawback is you have to poll for the status and response.
 */

export class ProgramExecuterService {
  private tmpWorkspacesParentDir: string = null;

  constructor(tmpWorkspacesParentDir: string) {
    this.tmpWorkspacesParentDir = tmpWorkspacesParentDir;
    // console.log(this.tmpWorkspacesParentDir);
  }

  async createTmpWorkspace() {
    const workspaceName = randomUUID();
    const tmpWorkspaceDir = path.join(this.tmpWorkspacesParentDir, workspaceName);
    await fs.promises.mkdir(tmpWorkspaceDir);
    return tmpWorkspaceDir;
  }

  async execute(workspaceDir: string, mainFile: string, inputs: string[], environment: string) {
    if (environment !== ExecutionEnvironment.PYTHON3.toString()) {
      throw new Error('Only support python environment for now');
    }
    const res = new SimpleExecuteResponseDto();
    res.outputs = [];
    const promises = inputs.map(async (input, index) => {
      const output = new ExecutionOutput();
      output.inputFile = input;
      const command =
        `cat ${path.join(workspaceDir, input)}` +
        `| docker run -i -v /var/run/docker.sock:/var/run/docker.sock  ` +
        `-v ${workspaceDir}:/home -m 256m --cpus="0.5" ` +
        `-w /home -a stdin -a stdout -a stderr  python timeout 5 python ${mainFile}`;
      try {
        const resExecution = await execute(command);
        output.outputFile = `output-${index}.txt`;
        await fs.promises.writeFile(path.join(workspaceDir, output.outputFile), resExecution.stdout);
        output.returnCode = 0;
      } catch (e) {
        output.returnCode = e.code; // 124 code means timeout
        output.errorFile = `error-${index}.txt`;
        await fs.promises.writeFile(path.join(workspaceDir, output.errorFile), e.stderr);
      }
      res.outputs.push(output);
    });

    await Promise.all(promises);
    res.workspaceDir = workspaceDir;
    return res;
  }

  async simpleExecute(
    sources: Express.Multer.File[],
    inputs: Express.Multer.File[],
    environment: string,
    mainFile: string
  ) {
    if (environment !== ExecutionEnvironment.PYTHON3.toLowerCase()) {
      throw new Error('Only support python environment for now');
    }
    const workspaceName = randomUUID();
    const tmpWorkspaceDir = path.join(this.tmpWorkspacesParentDir, workspaceName);

    await fs.promises.mkdir(tmpWorkspaceDir);
    const promises: Promise<void>[] = [];
    for (const source of sources) {
      let stream = source.buffer ? Readable.from(source.buffer) : source.stream;
      if (!stream) {
        stream = fs.createReadStream(source.path);
      }
      promises.push(writeToFile(stream, path.join(tmpWorkspaceDir, source.originalname)));
    }

    if (inputs) {
      // eslint-disable-next-line no-restricted-syntax
      for (const input of inputs) {
        let stream = input.buffer ? Readable.from(input.buffer) : input.stream;
        if (!stream) {
          stream = fs.createReadStream(input.path);
        }
        // eslint-disable-next-line no-await-in-loop
        promises.push(writeToFile(stream, path.join(tmpWorkspaceDir, input.originalname)));
      }
    }
    const res = new SimpleExecuteResponseDto();
    res.outputs = [];
    await Promise.all(promises);
    // eslint-disable-next-line no-restricted-syntax
    for (let i = 1; i <= inputs.length; i += 1) {
      const input = inputs[i - 1];
      const output = new ExecutionOutput();
      const command =
        `cat ${path.join(tmpWorkspaceDir, input.originalname)}` +
        `| docker run -i -v /var/run/docker.sock:/var/run/docker.sock  ` +
        `-v ${tmpWorkspaceDir}:/home -m 256m --cpus="0.5" ` +
        `-w /home -a stdin -a stdout -a stderr  python timeout 5 python ${mainFile}`;

      try {
        const resExecution = await execute(command);
        output.outputFile = `output-${i}.txt`;
        await fs.promises.writeFile(path.join(tmpWorkspaceDir, output.outputFile), resExecution.stdout);
        output.returnCode = 0;
      } catch (e) {
        output.returnCode = e.code; // 124 code means timeout
        output.errorFile = `error-${1}.txt`;
        await fs.promises.writeFile(path.join(tmpWorkspaceDir, output.errorFile), e.stderr);
      }
      res.outputs.push(output);
    }
    res.workspaceName = workspaceName;
    return res;
  }

  streamFile(workspaceName: string, fileName: string) {
    const tmpWorkspaceDir = path.join(this.tmpWorkspacesParentDir, workspaceName);
    return new StreamableFile(fs.createReadStream(path.join(tmpWorkspaceDir, fileName)));
  }
}
