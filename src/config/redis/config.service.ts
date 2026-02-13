import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisConfigService {
  constructor(private readonly configService: ConfigService) {}

  get host(): string | undefined {
    return this.configService.get<string>('redis.REDIS_HOST');
  }

  get port(): number | undefined {
    return this.configService.get<number>('redis.REDIS_PORT');
  }

  get password(): string | undefined {
    return this.configService.get<string>('redis.REDIS_PASSWORD');
  }
}
