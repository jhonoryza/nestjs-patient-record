import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

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

interface ValidationErrorResponse {
  statusCode: number;
  message: string[];
  error: string;
}

interface RFC7807Error {
  status: number;
  code: string;
  title?: string;
  detail?: string;
  errors?: { field?: string; message: string }[];
  meta: Meta;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const metaData = meta({ url: request.url, method: request.method });

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = 'INTERNAL_ERROR';
    let title: string = 'Internal Server Error';
    let detail: string | undefined;
    let errors: { field?: string; message: string }[] | undefined;

    status = exception.getStatus();

    const res = exception.getResponse();

    if (typeof res === 'string') {
      detail = res;
      title = res;
      code = res.toUpperCase().replace(/\s+/g, '_');
    }

    if (typeof res === 'object' && res !== null) {
      const typedRes = res as ValidationErrorResponse;

      // handle validation errors dari class-validator
      if (Array.isArray(typedRes.message)) {
        errors = typedRes.message.map((msg) => {
          // ambil kata pertama sebagai field (jika ada)
          const match = msg.match(/^(\w+)\s/);
          const field = match ? match[1] : undefined;
          return { field, message: msg };
        });
        title = 'Validation Error';
        code = 'BAD_REQUEST';
      } else if (typedRes.error && typedRes.message) {
        // custom error object
        detail = typedRes.message;
        title = typedRes.error;
        code = typedRes.error.toUpperCase().replace(/\s+/g, '_');
      }
    }

    const errorResponse: RFC7807Error = {
      status,
      code,
      title,
      detail,
      errors,
      meta: metaData,
    };

    return response.status(status).json(errorResponse);
  }
}
