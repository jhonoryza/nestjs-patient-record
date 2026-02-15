import { Patient } from '@models/core/Patient';
import { PatientVersion } from '@models/core/PatientVersion';
import { HttpException, Injectable } from '@nestjs/common';
import { ERole, EStatus } from '@utils/enum';
import { DateTime } from 'luxon';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CreateDto } from '../requests/cms.patient.request';
import {
  CmsPatient,
  CmsPatientListResponse,
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
      const patient = await Patient.create(
        {
          idCard: dataDto.idCard,
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
}
