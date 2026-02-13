import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthConfigService {
  constructor(private readonly configService: ConfigService) {}

  get algorithm(): string | undefined {
    return this.configService.get<string>('auth.JWT_ALGORITHM');
  }

  get keyFolderPath(): string | undefined {
    return this.configService.get<string>('auth.JWT_KEY_FOLDER');
  }

  get defaultExpireTime(): number | undefined {
    return this.configService.get<number>('auth.JWT_DEFAULT_EXPIRE_TIME');
  }

  get refreshExpireTime(): number | undefined {
    return this.configService.get<number>('auth.JWT_REFRESH_EXPIRE_TIME');
  }

  get secret(): string | undefined {
    return this.configService.get<string>('auth.JWT_SECRET_KEY');
  }

  get public(): string | undefined {
    return this.configService.get<string>('auth.JWT_PUBLIC_KEY');
  }
}
