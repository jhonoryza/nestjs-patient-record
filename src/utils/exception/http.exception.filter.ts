import { GqlContext } from '@common/auth/guard/gql.guard';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { GraphQLError } from 'graphql';

type MetaDTO = {
  url: string;
  method: string;
};

type Meta = {
  path: string;
  method: string;
  timestamp: string;
};

export const meta = (request: MetaDTO): Meta => ({
  path: request.url,
  method: request.method,
  timestamp: new Date().toISOString(),
});

interface RFC7807Error {
  status: number;
  code: string;
  title?: string;
  detail?: string;
  errors?: { field?: string; message: string }[];
  meta: Meta;
}

interface ErrResponse {
  statusCode: number;
  error: string;
  message: string | string[];
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private buildErrorResponse(
    exception: HttpException,
    path: string,
    method: string,
  ) {
    const status = exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const res = exception.getResponse?.() as ErrResponse;
    const code = (res.error ?? 'INTERNAL_ERROR').toUpperCase();
    const detail = typeof res === 'string' ? res : undefined;
    let errors: { field?: string; message: string }[] | undefined;

    if (typeof res === 'object' && res !== null) {
      if (Array.isArray(res.message)) {
        errors = res.message.map((msg) => {
          // ambil kata pertama sebagai field (jika ada)
          const match = msg.match(/^(\w+)\s/);
          const field = match ? match[1] : undefined;
          return { field, message: msg };
        });
      }
    }

    return {
      status,
      code,
      title: code,
      detail,
      meta: { path, method, timestamp: new Date().toISOString() },
      errors,
    } as RFC7807Error;
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctxType = host.getType<'http' | 'graphql'>();
    let path = '';
    let method = '';

    if (ctxType === 'http') {
      const ctx = host.switchToHttp();
      const request = ctx.getRequest<Request>();
      const response = ctx.getResponse<Response>();
      path = request.url;
      method = request.method;

      const errorResponse: RFC7807Error = this.buildErrorResponse(
        exception,
        path,
        method,
      );
      return response.status(errorResponse.status).json(errorResponse);
    }

    if (ctxType === 'graphql') {
      const gqlCtx = GqlArgumentsHost.create(host);
      const ctx = gqlCtx.getContext<GqlContext>();
      path = ctx?.req?.url ?? 'graphql';
      method = ctx?.req?.method ?? 'POST';

      const errorResponse: RFC7807Error = this.buildErrorResponse(
        exception,
        path,
        method,
      );
      throw new GraphQLError(errorResponse.title ?? 'Internal server error', {
        extensions: {
          ...errorResponse,
        },
      });
    }
  }
}
