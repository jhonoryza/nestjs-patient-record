import { CommonAuthModule } from '@common/auth/common.auth.module';
import { Module } from '@nestjs/common';
import { PatientResolver } from './patient.resolver';
import { CmsPatientService } from './services/cms.patient.service';

@Module({
  imports: [CommonAuthModule],
  providers: [PatientResolver, CmsPatientService],
})
export class PatientModule {}
