import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './config';
import schema from './schema';

export async function getModuleEnv<T>(configModule: T): Promise<T> {
  await ConfigModule.envVariablesLoaded;
  return configModule;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      expandVariables: true,
      validationSchema: schema,
    }),
  ],
  providers: [],
})
export class AppConfigModule {}
