import type { GqlContext } from '@common/auth/guard/gql.guard';
import { GqlAuthGuard } from '@common/auth/guard/gql.guard';
import { UseGuards } from '@nestjs/common';
import { Context, Query, Resolver } from '@nestjs/graphql';
import { CmsUser } from './viewmodels/user.viewmodel';

@Resolver(() => CmsUser)
export class CmsUserResolver {
  @Query(() => CmsUser)
  @UseGuards(GqlAuthGuard)
  getProfile(@Context() ctx: GqlContext): CmsUser {
    return {
      sub: ctx.user?.sub ?? '',
      role: ctx.user?.role ?? '',
    };
  }
}
