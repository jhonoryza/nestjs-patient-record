import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { join } from 'path';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: join(process.cwd(), 'src/schema/schema.gql'),
      context: ({ req, res }: { req: Request; res: Response }) => {
        const token = req.headers['authorization'] || '';
        return { req, res, token };
      },
    }),
  ],
})
export class GraphqlConfigModule {}
