import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import config from './config';
import { SequelizeConfigService } from './config.provider';
import schema from './schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      validationSchema: schema,
      validate(con) {
        return con;
      },
      envFilePath: [`.env.${process.env.DB_ENV}`, '.env'],
    }),
    SequelizeModule.forRootAsync({ useClass: SequelizeConfigService }),
  ],
})
export class DBConfigModule {}
