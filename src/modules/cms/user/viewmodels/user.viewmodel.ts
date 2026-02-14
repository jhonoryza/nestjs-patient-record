import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CmsUser {
  @Field()
  sub: string;

  @Field()
  role: string;
}
