import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './config';
import schema from './schema';
import { RedisProvider } from './config.provider';
import { RedisConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      expandVariables: true,
      isGlobal: true,
      validationSchema: schema,
    }),
  ],
  providers: [RedisProvider, RedisConfigService],
  exports: [RedisProvider],
})
export class RedisConfigModule {}
