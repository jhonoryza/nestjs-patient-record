import { CommonAuthModule } from '@common/auth/common.auth.module';
import { Module } from '@nestjs/common';
import { CmsUserResolver } from './user.resolver';

@Module({
  imports: [CommonAuthModule],
  providers: [CmsUserResolver],
})
export class UserModule {}
