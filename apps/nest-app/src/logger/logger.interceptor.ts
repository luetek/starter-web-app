import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClsService } from 'nestjs-cls';
import { ReqLogger } from './req-logger';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(
    private logger: ReqLogger,
    private cls: ClsService
  ) {
    logger.setContext(LoggerInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const res = context.switchToHttp().getResponse();
    const requestId =
      context.switchToHttp().getRequest().headers['X-Request-Id'] || this.cls.getId() || this.cls.get('CLS_ID');
    // Set Response Header
    res.set('X-Request-Id', requestId);
    return next.handle();
  }
}
