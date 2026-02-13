import { AppConfigModule } from '@config/app/config.module';
import { AuthConfigModule } from '@config/auth/config.module';
import { DBConfigModule } from '@config/database/config.module';
import { RedisConfigModule } from '@config/redis/config.module';

export const CONFIG_MODULES = [
  AppConfigModule,
  DBConfigModule,
  RedisConfigModule,
  AuthConfigModule,
];

export const MIDDLEWARE_MODULES = [
  //
];
