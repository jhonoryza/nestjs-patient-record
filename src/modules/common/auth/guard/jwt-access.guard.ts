import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAccessGuard extends AuthGuard('jwt-access') {
  canActivate(context: ExecutionContext) {
    // console.log('GUARD HIT');
    // const req = context.switchToHttp().getRequest();
    // console.log('HEADERS', req.headers);
    return super.canActivate(context);
  }
}
