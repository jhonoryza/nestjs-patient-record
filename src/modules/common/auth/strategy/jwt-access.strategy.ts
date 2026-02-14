import { AuthConfigService } from '@config/auth/config.provider';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Algorithm } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccessTokenPayload } from '../provider.service';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(authConfig: AuthConfigService) {
    const algorithm: Algorithm = authConfig.algorithm as unknown as Algorithm;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      algorithms: [algorithm],
      secretOrKey: authConfig.secret!,
      ignoreExpiration: false,
    });
  }

  onModuleInit() {}

  validate(payload: AccessTokenPayload) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    return {
      sub: payload.sub,
      role: payload.role,
    };
  }
}
