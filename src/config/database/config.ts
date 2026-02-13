import { registerAs } from '@nestjs/config';
import { join } from 'path';
import { Dialect } from 'sequelize';
import { SequelizeOptions } from 'sequelize-typescript';

export default registerAs('database', () => ({
  connection: process.env.DB_CONNECTION,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  name: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  readHost: process.env.DB_READ_HOST,
  readPort: process.env.DB_READ_PORT,
  readName: process.env.DB_READ_NAME,
  readUsername: process.env.DB_READ_USERNAME,
  readPassword: process.env.DB_READ_PASSWORD,
}));

export type DBConfig = {
  connection: Dialect;
  readName: string;
  readUsername: string;
  readPassword: string;
  readHost: string;
  readPort: number | string;
  name: string;
  username: string;
  host: string;
  password: string;
  port: number | string;
};
export function configMapping(dbConfig: DBConfig): SequelizeOptions {
  return {
    dialect: dbConfig.connection,
    logging: false,
    logQueryParameters: false,
    define: {
      underscored: true,
    },
    replication: {
      read: [
        {
          database: dbConfig.readName,
          username: dbConfig.readUsername,
          password: dbConfig.readPassword,
          host: dbConfig.readHost,
          port: +dbConfig.readPort,
        },
      ],
      write: {
        database: dbConfig.name,
        username: dbConfig.username,
        password: dbConfig.password,
        host: dbConfig.host,
        port: +dbConfig.port,
      },
    },
    pool: {
      min: 0,
      max: 100,
    },
    dialectOptions: {
      // decimalNumbers: true,
      // timezone: '+07:00',
    },
    // timezone: '+07:00',
    models: [join(__dirname, '../../models/core')],
  };
}
