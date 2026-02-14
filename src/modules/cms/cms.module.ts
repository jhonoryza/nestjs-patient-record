import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { CmsAuthModule } from './auth/cms.auth.module';
import { PatientModule } from './patient/patient.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    CmsAuthModule,
    RouterModule.register([
      {
        path: 'cms',
        module: CmsAuthModule,
      },
    ]),
    PatientModule,
    UserModule,
  ],
})
export class CmsModule {}
