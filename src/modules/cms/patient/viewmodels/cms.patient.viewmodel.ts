import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CmsPatient {
  @Field()
  id!: string;

  @Field()
  status!: string;

  @Field()
  idCard!: string;

  @Field()
  fullName!: string;

  @Field()
  diagnosis!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field()
  createdBy!: string;

  @Field()
  updatedBy!: string;
}

@ObjectType()
export class PaginationMeta {
  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  limit!: number;

  @Field(() => Int)
  totalItems!: number;

  @Field(() => Int)
  totalPages!: number;

  @Field()
  hasNextPage!: boolean;

  @Field()
  hasPrevPage!: boolean;
}

@ObjectType()
export class CmsPatientListResponse {
  @Field(() => [CmsPatient])
  items!: CmsPatient[];

  @Field(() => PaginationMeta)
  meta!: PaginationMeta;
}
