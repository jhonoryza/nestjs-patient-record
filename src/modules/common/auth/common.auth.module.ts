import { AuthConfigModule } from '@config/auth/config.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthProvider } from './provider.service';
import { JwtAccessStrategy } from './strategy/jwt-access.strategy';

@Module({
  imports: [AuthConfigModule, JwtModule.register({}), PassportModule],
  providers: [AuthProvider, JwtAccessStrategy],
  exports: [AuthProvider],
})
export class CommonAuthModule {}
