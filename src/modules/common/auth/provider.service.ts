import { AuthConfigService } from '@config/auth/config.provider';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ERole } from '@utils/enum';
import { Algorithm } from 'jsonwebtoken';
import { DateTime } from 'luxon';
import type { StringValue } from 'ms';

interface JwtBasePayload {
  sub: string;
  iat?: number;
  exp?: number;
}

export interface AccessTokenPayload extends JwtBasePayload {
  type: 'access';
  role: ERole;
}

export interface RefreshTokenPayload extends JwtBasePayload {
  type: 'refresh';
  role: ERole;
}

export interface AuthConfig {
  secret: string;
  algorithm: Algorithm;
  refreshExpireTime: number;
}

@Injectable()
export class AuthProvider {
  constructor(
    private readonly authConfigService: AuthConfigService,
    private readonly jwtService: JwtService,
  ) {}

  generateAccessToken(
    userName: string,
    role: ERole,
  ): {
    accessToken: string;
    expiresIn: number;
  } {
    const {
      algorithm,
      defaultExpireTime: expiresIn,
      secret,
    } = this.authConfigService;
    const expirationTime = `${expiresIn} second`;
    const payload: AccessTokenPayload = {
      sub: userName,
      role,
      type: 'access',
    };
    const token = this.jwtService.sign<AccessTokenPayload>(payload, {
      secret: secret as string,
      expiresIn: expirationTime as StringValue,
      algorithm: algorithm as Algorithm,
    });
    const epochExpired = DateTime.now()
      .plus({ second: expiresIn })
      .toUnixInteger();
    return {
      accessToken: token,
      expiresIn: epochExpired,
    };
  }

  generateRefreshToken(userName: string, role: ERole): string {
    const {
      algorithm,
      refreshExpireTime: expiresIn,
      secret,
    } = this.authConfigService;
    const expirationTime = `${expiresIn} second`;

    const payload: RefreshTokenPayload = {
      sub: userName,
      role,
      type: 'refresh',
    };
    return this.jwtService.sign<RefreshTokenPayload>(payload, {
      secret,
      expiresIn: expirationTime as StringValue,
      algorithm: algorithm as Algorithm,
    });
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    const { algorithm, secret } = this.authConfigService;
    let decoded: RefreshTokenPayload;
    try {
      decoded = this.jwtService.verify(token, {
        algorithms: [algorithm as Algorithm],
        secret: secret!,
        ignoreExpiration: false,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }
    return decoded;
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    const { algorithm, secret } = this.authConfigService;
    let decoded: AccessTokenPayload;
    try {
      decoded = this.jwtService.verify(token, {
        algorithms: [algorithm as Algorithm],
        secret: secret!,
        ignoreExpiration: false,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }

    if (decoded.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }
    return decoded;
  }
}
