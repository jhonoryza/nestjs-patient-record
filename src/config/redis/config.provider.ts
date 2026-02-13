import { Provider } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisConfigService } from './config.service';

export const RedisProvider: Provider = {
  provide: Redis,
  useFactory: (config: RedisConfigService) => new Redis({
    host: config.host,
    port: config.port,
    password: config.password,
  }),
  inject: [RedisConfigService],
};
