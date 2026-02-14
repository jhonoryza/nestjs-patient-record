import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { projectVersion } from 'main';
import { Observable, tap } from 'rxjs';

@Injectable()
export class GlobalCustomResponseInterceptor<T> implements NestInterceptor<T> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        response.header('project-version', projectVersion);
      }),
    ) as Observable<T>;
  }
}
