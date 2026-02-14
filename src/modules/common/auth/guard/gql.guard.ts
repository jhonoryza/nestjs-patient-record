import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { AccessTokenPayload, AuthProvider } from '../provider.service';

export interface GqlContext {
  req: Request;
  res: Response;
  token?: string;
  user?: AccessTokenPayload;
}

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private readonly authProvider: AuthProvider) {}

  canActivate(context: ExecutionContext): boolean {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext<GqlContext>();
    const { token } = ctx;
    if (!token) {
      throw new UnauthorizedException();
    }

    const payload: AccessTokenPayload = this.authProvider.verifyAccessToken(
      token.replace('Bearer ', ''),
    );
    ctx.user = payload;
    return true;
  }
}
