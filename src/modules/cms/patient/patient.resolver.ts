import type { GqlContext } from '@common/auth/guard/gql.guard';
import { GqlAuthGuard } from '@common/auth/guard/gql.guard';
import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreateDto,
  PatientListArgs,
  RollbackDto,
  UpdateDto,
} from './requests/cms.patient.request';
import { CmsPatientService } from './services/cms.patient.service';
import {
  CmsPatient,
  CmsPatientListResponse,
  CmsPatientVersion,
} from './viewmodels/cms.patient.viewmodel';

@Resolver(() => CmsPatient)
export class PatientResolver {
  constructor(private readonly cmsPatientService: CmsPatientService) {}

  /**
   *
   *
   query {
     getPatients(input: { page: 1, limit: 10 }) {
       items {
         id
         idCard
         status
         fullName
         diagnosis
         createdAt
         createdBy
         updatedAt
         updatedBy
       }
       meta {
         page
         limit
         totalItems
         totalPages
         hasNextPage
         hasPrevPage
       }
     }
   }
   */
  @Query(() => CmsPatientListResponse)
  @UseGuards(GqlAuthGuard)
  getPatients(
    @Args('input', { type: () => PatientListArgs, nullable: true })
    input?: PatientListArgs,
  ): Promise<CmsPatientListResponse> {
    return this.cmsPatientService.index({
      page: input?.page,
      limit: input?.limit,
    });
  }

  /**
   *
   query {
     getPatient(id: "patient-id") {
       id
       patientId
       version
       fullName
       birthDate
       gender
       diagnosis
       medicalNotes
       changeType
       updatedBy
       updatedAt
     }
   }
   */
  @Query(() => CmsPatientVersion)
  @UseGuards(GqlAuthGuard)
  getPatient(
    @Args('id', { type: () => String }) id: string,
  ): Promise<CmsPatientVersion> {
    return this.cmsPatientService.show(id);
  }

  /**
   *
   mutation {
     storePatient(
       data: {
         idCard: "1234567890"
         fullName: "John Doe"
         diagnosis: "Diabetes"
         changeType: "create"
         birthDate: "1990-11-18T00:00:00.000Z"
         gender: "male"
       }
     ) {
       id
       idCard
       status
       fullName
       diagnosis
       createdAt
       createdBy
       updatedAt
       updatedBy
     }
   }
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => CmsPatient)
  storePatient(
    @Context() ctx: GqlContext,
    @Args('data', { type: () => CreateDto }) data: CreateDto,
  ): Promise<CmsPatient> {
    const sub = ctx.user?.sub ?? '';
    const role = ctx.user?.role ?? null;

    return this.cmsPatientService.store({ sub, role }, data);
  }

  /**
   *
   mutation {
     updatePatient(
       id: "patient-id"
       data: {
         fullName: "John Updated"
         diagnosis: "Diabetes Type 2"
         birthDate: "1990-11-18T00:00:00.000Z"
         gender: "male"
         medicalNotes: "Patient needs regular checkups"
       }
     ) {
       id
       idCard
       status
       fullName
       diagnosis
       createdAt
       createdBy
       updatedAt
       updatedBy
     }
   }
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => CmsPatient)
  updatePatient(
    @Context() ctx: GqlContext,
    @Args('id', { type: () => String }) id: string,
    @Args('data', { type: () => UpdateDto }) data: UpdateDto,
  ): Promise<CmsPatient> {
    const sub = ctx.user?.sub ?? '';
    const role = ctx.user?.role ?? null;

    return this.cmsPatientService.update({ sub, role }, id, data);
  }

  /**
   *
   mutation {
     deletePatient(id: "patient-id") {
       id
       idCard
       status
       fullName
       diagnosis
       createdAt
       createdBy
       updatedAt
       updatedBy
     }
   }
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => CmsPatient)
  deletePatient(
    @Context() ctx: GqlContext,
    @Args('id', { type: () => String }) id: string,
  ): Promise<CmsPatient> {
    const sub = ctx.user?.sub ?? '';
    const role = ctx.user?.role ?? null;

    return this.cmsPatientService.delete({ sub, role }, id);
  }

  /**
   *
   mutation {
     restorePatient(id: "patient-id") {
       id
       idCard
       status
       fullName
       diagnosis
       createdAt
       createdBy
       updatedAt
       updatedBy
     }
   }
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => CmsPatient)
  restorePatient(
    @Context() ctx: GqlContext,
    @Args('id', { type: () => String }) id: string,
  ): Promise<CmsPatient> {
    const sub = ctx.user?.sub ?? '';
    const role = ctx.user?.role ?? null;

    return this.cmsPatientService.restore({ sub, role }, id);
  }

  /**
   *
   query {
     getAuditLog(patientId: "patient-id") {
       id
       patientId
       version
       fullName
       birthDate
       gender
       diagnosis
       medicalNotes
       changeType
       updatedBy
       updatedAt
     }
   }
   */
  @Query(() => [CmsPatientVersion])
  @UseGuards(GqlAuthGuard)
  getAuditLog(
    @Context() ctx: GqlContext,
    @Args('patientId', { type: () => String }) patientId: string,
  ): Promise<CmsPatientVersion[]> {
    const sub = ctx.user?.sub ?? '';
    const role = ctx.user?.role ?? null;

    return this.cmsPatientService.getAuditLog({ sub, role }, patientId);
  }

  /**
   *
   mutation {
     rollbackPatient(
       data: {
         patientId: "patient-id"
         versionId: "version-id"
       }
     ) {
       id
       idCard
       status
       fullName
       diagnosis
       createdAt
       createdBy
       updatedAt
       updatedBy
     }
   }
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => CmsPatient)
  rollbackPatient(
    @Context() ctx: GqlContext,
    @Args('data', { type: () => RollbackDto }) data: RollbackDto,
  ): Promise<CmsPatient> {
    const sub = ctx.user?.sub ?? '';
    const role = ctx.user?.role ?? null;

    return this.cmsPatientService.rollback(
      { sub, role },
      data.patientId,
      data.versionId,
    );
  }
}
