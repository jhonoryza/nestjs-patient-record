import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import config from './config';
import { AuthConfigService } from './config.provider';
import schema from './schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      expandVariables: true,
      validationSchema: schema,
    }),
  ],
  providers: [AuthConfigService],
  exports: [AuthConfigService],
})
export class AuthConfigModule {}
