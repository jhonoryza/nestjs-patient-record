import { Patient } from '@models/core/Patient';
import { PatientVersion } from '@models/core/PatientVersion';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { EStatus } from '@utils/enum';
import { Job } from 'bullmq';
import { Sequelize } from 'sequelize-typescript';
import { PATIENT_CLEANUP_QUEUE } from './patient-cleanup.constants';

@Injectable()
@Processor(PATIENT_CLEANUP_QUEUE)
export class PatientCleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(PatientCleanupProcessor.name);

  constructor(private readonly sequelize: Sequelize) {
    super();
  }

  async process(job: Job<{ patientId: string }>): Promise<void> {
    const { patientId } = job.data;
    this.logger.log(`Processing cleanup job for patient: ${patientId}`);

    try {
      const patient = await Patient.findOne({
        where: { id: patientId },
      });

      if (!patient) {
        this.logger.warn(`Patient not found, skipping cleanup: ${patientId}`);
        return;
      }

      if (patient.status !== EStatus.TRASH) {
        this.logger.log(
          `Patient is not in trash status, skipping cleanup: ${patientId}`,
        );
        return;
      }

      await this.sequelize.transaction(async (transaction) => {
        const deletedVersions = await PatientVersion.destroy({
          where: { patientId },
          transaction,
        });

        this.logger.log(
          `Deleted ${deletedVersions} versions for patient: ${patientId}`,
        );

        await patient.destroy({ transaction });

        this.logger.log(
          `Successfully hard deleted patient and all versions: ${patientId}`,
        );
      });
    } catch (error) {
      this.logger.error(`Failed to cleanup patient: ${patientId}`, error);
      throw error;
    }
  }
}
