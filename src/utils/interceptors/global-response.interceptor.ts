import { GqlContext } from '@common/auth/guard/gql.guard';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Response } from 'express';
import { projectVersion } from 'main';
import { Observable, tap } from 'rxjs';

@Injectable()
export class GlobalCustomResponseInterceptor<T> implements NestInterceptor<T> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    const type = context.getType<'http' | 'graphql'>();
    const isHttp = type === 'http';
    const isGraphql = type === 'graphql';

    return next.handle().pipe(
      tap(() => {
        if (isHttp) {
          const response = context.switchToHttp().getResponse<Response>();
          response.header('project-version', projectVersion);
        }

        if (isGraphql) {
          const ctx =
            GqlExecutionContext.create(context).getContext<GqlContext>();
          if (ctx?.res) {
            ctx.res.header('project-version', projectVersion);
          }
        }
      }),
    ) as Observable<T>;
  }
}
