import type { GqlContext } from '@common/auth/guard/gql.guard';
import { GqlAuthGuard } from '@common/auth/guard/gql.guard';
import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateDto, PatientListArgs } from './requests/cms.patient.request';
import { CmsPatientService } from './services/cms.patient.service';
import {
  CmsPatient,
  CmsPatientListResponse,
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
   * @returns
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
}
