import { Patient } from '@models/core/Patient';
import { PatientVersion } from '@models/core/PatientVersion';
import { HttpException, Injectable } from '@nestjs/common';
import { EChangeType, ERole, EStatus } from '@utils/enum';
import { DateTime } from 'luxon';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CreateDto, UpdateDto } from '../requests/cms.patient.request';
import {
  CmsPatient,
  CmsPatientListResponse,
  CmsPatientVersion,
} from '../viewmodels/cms.patient.viewmodel';

type PatientRow = {
  id: string;
  id_card: string;
  status: string;
  full_name: string;
  diagnosis: string;
  created_at: Date;
  updated_at: Date;
  updated_by: string;
  created_by: string;
};

type PatientRowWithCount = PatientRow & {
  total_count: string | number;
};

type PaginationArgs = {
  page?: number;
  limit?: number;
};

type RequesterDto = {
  sub: string;
  role: ERole | null;
};

@Injectable()
export class CmsPatientService {
  constructor(private readonly sequelize: Sequelize) {}

  async index(args?: PaginationArgs): Promise<CmsPatientListResponse> {
    const page = Math.max(args?.page ?? 1, 1);
    const limit = Math.min(Math.max(args?.limit ?? 20, 1), 100);
    const offset = (page - 1) * limit;

    const rows = await this.sequelize.query<PatientRowWithCount>(
      `
        SELECT
          p.id,
          p.id_card,
          p.status,
          v.full_name,
          v.diagnosis,
          p.created_at,
          p.created_by,
          v.updated_at,
          v.updated_by,
          COUNT(*) OVER() AS total_count
        FROM patients p
        JOIN LATERAL (
          SELECT pv.*
          FROM patient_versions pv
          WHERE pv.patient_id = p.id
          ORDER BY pv.updated_at DESC, pv.id DESC
          LIMIT 1
        ) v ON TRUE
        WHERE p.status = :status
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT :limit
        OFFSET :offset
      `,
      {
        replacements: {
          status: EStatus.ACTIVE,
          limit,
          offset,
        },
        type: QueryTypes.SELECT,
      },
    );

    const totalItems = rows.length ? Number(rows[0].total_count) : 0;
    const items: CmsPatient[] = rows.map((row) => ({
      id: row.id,
      idCard: row.id_card,
      status: row.status,
      fullName: row.full_name,
      diagnosis: row.diagnosis,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      updatedBy: row.updated_by,
      createdBy: row.created_by,
    }));

    return {
      items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: totalItems ? Math.ceil(totalItems / limit) : 0,
        hasNextPage: page * limit < totalItems,
        hasPrevPage: page > 1,
      },
    };
  }

  async store(
    requesterDto: RequesterDto,
    dataDto: CreateDto,
  ): Promise<CmsPatient> {
    if (!requesterDto.role) {
      throw new HttpException(
        'You are not allowed to perform this action',
        403,
      );
    }

    if (requesterDto.role === ERole.ADMIN) {
      throw new HttpException(
        'You are not allowed to perform this action',
        403,
      );
    }
    const existingPatient = await Patient.findOne({
      where: {
        idCard: dataDto.idCard,
      },
    });
    if (existingPatient) {
      throw new HttpException('Patient with this idCard already exists', 400);
    }
    return this.sequelize.transaction(async (t) => {
      const latestVersion = await PatientVersion.findOne({
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['id'],
            where: { idCard: dataDto.idCard },
          },
        ],
        order: [['version', 'DESC']],
        transaction: t,
      });

      const nextVersion = (latestVersion?.version ?? 0) + 1;

      const patient = await Patient.create(
        {
          idCard: dataDto.idCard,
          version: nextVersion,
          status: EStatus.ACTIVE,
          createdBy: requesterDto.sub,
          createdAt: DateTime.now(),
        },
        { transaction: t },
      );

      const patientVersion = await PatientVersion.create(
        {
          ...dataDto,
          patientId: patient.id,
          updatedBy: requesterDto.sub,
          updatedAt: DateTime.now(),
        },
        { transaction: t },
      );

      const patientRow: CmsPatient = {
        id: patient.id,
        idCard: patient.idCard,
        status: patient.status,
        fullName: patientVersion.fullName,
        diagnosis: patientVersion.diagnosis,
        createdAt: patient.createdAt,
        createdBy: patient.createdBy,
        updatedAt: patientVersion.updatedAt,
        updatedBy: patientVersion.updatedBy,
      };

      return patientRow;
    });
  }

  async update(
    requesterDto: RequesterDto,
    id: string,
    dataDto: UpdateDto,
  ): Promise<CmsPatient> {
    if (!requesterDto.role) {
      throw new HttpException(
        'You are not allowed to perform this action',
        403,
      );
    }

    if (requesterDto.role === ERole.ADMIN) {
      throw new HttpException(
        'You are not allowed to perform this action',
        403,
      );
    }

    const patient = await Patient.findOne({
      where: { id },
    });

    if (!patient) {
      throw new HttpException('Patient not found', 404);
    }

    if (patient.status === EStatus.TRASH) {
      throw new HttpException('Cannot update a trashed patient', 400);
    }

    return this.sequelize.transaction(async (t) => {
      const latestVersion = await PatientVersion.findOne({
        where: { patientId: patient.id },
        order: [['version', 'DESC']],
        transaction: t,
      });

      const nextVersion = (latestVersion?.version ?? 0) + 1;

      const patientVersion = await PatientVersion.create(
        {
          patientId: patient.id,
          version: nextVersion,
          fullName: dataDto.fullName,
          birthDate: dataDto.birthDate,
          gender: dataDto.gender,
          diagnosis: dataDto.diagnosis,
          medicalNotes: dataDto.medicalNotes ?? null,
          changeType: EChangeType.UPDATE,
          updatedBy: requesterDto.sub,
          updatedAt: DateTime.now(),
        },
        { transaction: t },
      );

      const patientRow: CmsPatient = {
        id: patient.id,
        idCard: patient.idCard,
        status: patient.status,
        fullName: patientVersion.fullName,
        diagnosis: patientVersion.diagnosis,
        createdAt: patient.createdAt,
        createdBy: patient.createdBy,
        updatedAt: patientVersion.updatedAt,
        updatedBy: patientVersion.updatedBy,
      };

      return patientRow;
    });
  }

  async delete(requesterDto: RequesterDto, id: string): Promise<CmsPatient> {
    if (!requesterDto.role) {
      throw new HttpException(
        'You are not allowed to perform this action',
        403,
      );
    }

    if (requesterDto.role === ERole.ADMIN) {
      throw new HttpException(
        'You are not allowed to perform this action',
        403,
      );
    }

    const patient = await Patient.findOne({
      where: { id },
    });

    if (!patient) {
      throw new HttpException('Patient not found', 404);
    }

    if (patient.status === EStatus.TRASH) {
      throw new HttpException('Patient already in trash', 400);
    }

    return this.sequelize.transaction(async (t) => {
      const latestVersion = await PatientVersion.findOne({
        where: { patientId: patient.id },
        order: [['version', 'DESC']],
        transaction: t,
      });

      const nextVersion = (latestVersion?.version ?? 0) + 1;

      const latestVersionData = await PatientVersion.findOne({
        where: { patientId: patient.id },
        order: [
          ['updatedAt', 'DESC'],
          ['id', 'DESC'],
        ],
        transaction: t,
      });

      await patient.update(
        {
          status: EStatus.TRASH,
          trashedAt: DateTime.now().toJSDate(),
        },
        { transaction: t },
      );

      const patientVersion = await PatientVersion.create(
        {
          patientId: patient.id,
          version: nextVersion,
          fullName: latestVersionData!.fullName,
          birthDate: latestVersionData!.birthDate,
          gender: latestVersionData!.gender,
          diagnosis: latestVersionData!.diagnosis,
          medicalNotes: latestVersionData!.medicalNotes,
          changeType: EChangeType.DELETE,
          updatedBy: requesterDto.sub,
          updatedAt: DateTime.now(),
        },
        { transaction: t },
      );

      const { id: patientId, idCard, status, createdAt, createdBy } = patient;
      const { fullName, diagnosis, updatedAt, updatedBy } = patientVersion;

      return {
        id: patientId,
        idCard,
        status,
        fullName,
        diagnosis,
        createdAt,
        createdBy,
        updatedAt,
        updatedBy,
      };
    });
  }

  async restore(requesterDto: RequesterDto, id: string): Promise<CmsPatient> {
    if (!requesterDto.role) {
      throw new HttpException(
        'You are not allowed to perform this action',
        403,
      );
    }

    if (requesterDto.role === ERole.ADMIN) {
      throw new HttpException(
        'You are not allowed to perform this action',
        403,
      );
    }

    const patient = await Patient.findOne({
      where: { id },
    });

    if (!patient) {
      throw new HttpException('Patient not found', 404);
    }

    if (patient.status === EStatus.ACTIVE) {
      throw new HttpException('Patient is already active', 400);
    }

    return this.sequelize.transaction(async (t) => {
      const latestVersion = await PatientVersion.findOne({
        where: { patientId: patient.id },
        order: [['version', 'DESC']],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const nextVersion = (latestVersion?.version ?? 0) + 1;

      const latestVersionData = await PatientVersion.findOne({
        where: { patientId: patient.id },
        order: [
          ['updatedAt', 'DESC'],
          ['id', 'DESC'],
        ],
        transaction: t,
      });

      await patient.update(
        {
          status: EStatus.ACTIVE,
          trashedAt: null,
        },
        { transaction: t },
      );

      const patientVersion = await PatientVersion.create(
        {
          patientId: patient.id,
          version: nextVersion,
          fullName: latestVersionData!.fullName,
          birthDate: latestVersionData!.birthDate,
          gender: latestVersionData!.gender,
          diagnosis: latestVersionData!.diagnosis,
          medicalNotes: latestVersionData!.medicalNotes,
          changeType: EChangeType.RESTORE,
          updatedBy: requesterDto.sub,
          updatedAt: DateTime.now(),
        },
        { transaction: t },
      );

      const { id: patientId, idCard, status, createdAt, createdBy } = patient;
      const { fullName, diagnosis, updatedAt, updatedBy } = patientVersion;

      return {
        id: patientId,
        idCard,
        status,
        fullName,
        diagnosis,
        createdAt,
        createdBy,
        updatedAt,
        updatedBy,
      };
    });
  }

  async getAuditLog(
    requesterDto: RequesterDto,
    patientId: string,
  ): Promise<CmsPatientVersion[]> {
    if (!requesterDto.role) {
      throw new HttpException(
        'You are not allowed to perform this action',
        403,
      );
    }

    if (requesterDto.role !== ERole.ADMIN) {
      throw new HttpException('Only admin can view audit logs', 403);
    }

    const patient = await Patient.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new HttpException('Patient not found', 404);
    }

    const versions = await PatientVersion.findAll({
      where: { patientId },
      order: [
        ['version', 'DESC'],
        ['updatedAt', 'DESC'],
        ['id', 'DESC'],
      ],
    });

    return versions.map((v) => ({
      id: v.id,
      patientId: v.patientId,
      version: v.version,
      fullName: v.fullName,
      birthDate: v.birthDate,
      gender: v.gender,
      diagnosis: v.diagnosis,
      medicalNotes: v.medicalNotes,
      changeType: v.changeType,
      updatedBy: v.updatedBy,
      updatedAt: v.updatedAt,
    }));
  }

  async rollback(
    requesterDto: RequesterDto,
    patientId: string,
    versionId: string,
  ): Promise<CmsPatient> {
    if (!requesterDto.role) {
      throw new HttpException(
        'You are not allowed to perform this action',
        403,
      );
    }

    if (requesterDto.role !== ERole.ADMIN) {
      throw new HttpException('Only admin can perform this action', 403);
    }

    const patient = await Patient.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new HttpException('Patient not found', 404);
    }

    if (patient.status === EStatus.TRASH) {
      throw new HttpException('Cannot rollback a trashed patient', 400);
    }

    const targetVersion = await PatientVersion.findOne({
      where: {
        version: versionId,
        patientId,
      },
    });

    if (!targetVersion) {
      throw new HttpException('Version not found', 404);
    }

    return this.sequelize.transaction(async (t) => {
      const latestVersion = await PatientVersion.findOne({
        where: { patientId: patient.id },
        order: [['version', 'DESC']],
        transaction: t,
      });

      const nextVersion = (latestVersion?.version ?? 0) + 1;

      const patientVersion = await PatientVersion.create(
        {
          patientId: patient.id,
          version: nextVersion,
          fullName: targetVersion.fullName,
          birthDate: targetVersion.birthDate,
          gender: targetVersion.gender,
          diagnosis: targetVersion.diagnosis,
          medicalNotes: targetVersion.medicalNotes,
          changeType: EChangeType.ROLLBACK,
          updatedBy: requesterDto.sub,
          updatedAt: DateTime.now(),
        },
        { transaction: t },
      );

      const { id: pId, idCard, status, createdAt, createdBy } = patient;
      const { fullName, diagnosis, updatedAt, updatedBy } = patientVersion;

      return {
        id: pId,
        idCard,
        status,
        fullName,
        diagnosis,
        createdAt,
        createdBy,
        updatedAt,
        updatedBy,
      };
    });
  }
}
