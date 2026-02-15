import { Field, ObjectType } from '@nestjs/graphql';
import { ERole } from '@utils/enum';

@ObjectType()
export class CmsUser {
  @Field()
  sub: string;

  @Field()
  role: ERole | string;
}
