import { AuthConfigService } from '@config/auth/config.provider';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DateTime } from 'luxon';
import { Algorithm } from 'jsonwebtoken';
import type { StringValue } from 'ms';

interface RefreshTokenVerify {
  sub: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
}

interface JwtBasePayload {
  sub: string;
  iat?: number;
  exp?: number;
}

export interface AccessTokenPayload extends JwtBasePayload {
  type: 'access';
  role: string;
}

export interface RefreshTokenPayload extends JwtBasePayload {
  type: 'refresh';
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

  generateAccessToken(userName: string) {
    const {
      algorithm,
      refreshExpireTime: expiresIn,
      secret,
    } = this.authConfigService;
    const expirationTime = `${expiresIn} second`;
    const payload: AccessTokenPayload = {
      sub: userName,
      role: 'admin',
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

  generateRefreshToken(userName: string) {
    const {
      algorithm,
      refreshExpireTime: expiresIn,
      secret,
    } = this.authConfigService;
    const expirationTime = `${expiresIn} second`;

    const payload: RefreshTokenPayload = {
      sub: userName,
      type: 'refresh',
    };
    return this.jwtService.sign<RefreshTokenPayload>(payload, {
      secret,
      expiresIn: expirationTime as StringValue,
      algorithm: algorithm as Algorithm,
    });
  }

  verifyRefreshToken(token: string) {
    const { algorithm, secret } = this.authConfigService;
    let decoded: RefreshTokenVerify;
    try {
      decoded = this.jwtService.verify(token, {
        algorithms: [algorithm as any],
        secret: secret!,
        ignoreExpiration: false,
      });
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token: ' + e);
    }

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }
    return decoded;
  }
}
