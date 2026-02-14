import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { CmsAuthModule } from './auth/cms.auth.module';

@Module({
  imports: [
    CmsAuthModule,
    RouterModule.register([
      {
        path: 'cms',
        module: CmsAuthModule,
      },
    ]),
  ],
})
export class CmsModule {}
