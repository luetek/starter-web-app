import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable({ scope: Scope.TRANSIENT })
export class ReqLogger extends ConsoleLogger {
  constructor(private readonly cls: ClsService) {
    super();
  }

  log(message: string) {
    super.log(`${this.cls ? this.cls.getId() || this.cls.get('CLS_ID') : ''}  ${message}`);
  }

  error(message: string) {
    super.error(`${this.cls.getId() || this.cls.get('CLS_ID') || ''}  ${message}`);
  }

  warn(message: string) {
    super.warn(`${this.cls.getId() || this.cls.get('CLS_ID') || ''}  ${message}`);
  }
}
