import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { ReqLogger } from '../logger/req-logger';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private logger: ReqLogger
  ) {
    logger.setContext(AppController.name);
  }

  @Get()
  getData() {
    this.logger.log('ping called');
    return this.appService.getData();
  }
}
