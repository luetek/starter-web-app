/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { randomUUID } from 'crypto';
import util from 'util';
import { exec } from 'child_process';
import { StreamableFile } from '@nestjs/common';

import { SubmissionRequestDto } from './dtos/submission.request.dto';

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

export class SubmissionService {
  private tmpWorkspacesParentDir: string = null;

  constructor(tmpWorkspacesParentDir: string) {
    this.tmpWorkspacesParentDir = tmpWorkspacesParentDir;
    // console.log(this.tmpWorkspacesParentDir);
  }

  create(inputs: Express.Multer.File[], req: SubmissionRequestDto) {}
}
