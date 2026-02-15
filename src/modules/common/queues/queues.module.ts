import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PATIENT_CLEANUP_QUEUE } from './patient-cleanup/patient-cleanup.constants';
import { PatientCleanupProcessor } from './patient-cleanup/patient-cleanup.processor';
import { PatientCleanupService } from './patient-cleanup/patient-cleanup.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: PATIENT_CLEANUP_QUEUE,
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
  ],
  providers: [PatientCleanupService, PatientCleanupProcessor],
  exports: [PatientCleanupService],
})
export class QueuesModule {}
