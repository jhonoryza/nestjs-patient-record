import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { CmsAuthModule } from './auth/cms.auth.module';
import { PatientModule } from './patient/patient.module';

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
  ],
})
export class CmsModule {}
