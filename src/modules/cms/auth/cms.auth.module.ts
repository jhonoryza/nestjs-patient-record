import { CommonAuthModule } from '@common/auth/common.auth.module';
import { Module } from '@nestjs/common';
import { CmsAuthController } from './controllers/cms.auth.controller';
import { CmsAuthService } from './services/cms.auth.service';

@Module({
  imports: [CommonAuthModule],
  controllers: [CmsAuthController],
  providers: [CmsAuthService],
  exports: [],
})
export class CmsAuthModule {}
