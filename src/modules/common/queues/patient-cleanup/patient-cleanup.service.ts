import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  GRACE_PERIOD_MINUTES,
  PATIENT_CLEANUP_QUEUE,
} from './patient-cleanup.constants';

@Injectable()
export class PatientCleanupService {
  private readonly logger = new Logger(PatientCleanupService.name);

  constructor(
    @InjectQueue(PATIENT_CLEANUP_QUEUE)
    private readonly patientCleanupQueue: Queue,
  ) {}

  /**
   * Add a job to clean up a patient after the grace period
   */
  async scheduleCleanup(patientId: string): Promise<void> {
    try {
      await this.patientCleanupQueue.add(
        PATIENT_CLEANUP_QUEUE,
        { patientId },
        {
          delay: GRACE_PERIOD_MINUTES * 60 * 1000, // in milliseconds
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
      this.logger.log(`Scheduled cleanup job for patient: ${patientId}`);
    } catch (error) {
      this.logger.error(
        `Failed to schedule cleanup job for patient: ${patientId}`,
        error,
      );
      throw error;
    }
  }
}
