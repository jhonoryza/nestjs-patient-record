import * as fs from 'fs';
import { Sequelize } from 'sequelize-typescript';
import { SequelizeStorage, Umzug } from 'umzug';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { databasePath } from '../../migrations/migration-template';
import { configMapping } from './config';
import { Dialect } from 'sequelize';

/** DATABASE MIGRATOR */

const { DB_ENV } = dotenv.parse(fs.readFileSync('.env'));
const fileName = `.env${DB_ENV ? `.${DB_ENV}` : ''}`;
const env = fs.existsSync(fileName)
  ? dotenv.parse(fs.readFileSync(fileName))
  : dotenv.parse(fs.readFileSync('.env'));
const sequelize = new Sequelize({
  ...configMapping({
    connection: env.DB_CONNECTION as Dialect,
    host: env.DB_HOST,
    port: env.DB_PORT,
    name: env.DB_NAME,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    readHost: env.DB_READ_HOST,
    readPort: env.DB_READ_PORT,
    readName: env.DB_READ_NAME,
    readUsername: env.DB_READ_USERNAME,
    readPassword: env.DB_READ_PASSWORD,
  }),
  logging: console.log,
});

const mainPath = join(__dirname, '../../');

export const migrator = new Umzug({
  migrations: {
    // glob: `${databasePath}/core/*.ts`,
    glob: ['migrations/core/*.ts', { cwd: mainPath }],
  },
  create: {
    folder: `${databasePath}/core`,
    template: (filepath) => [
      [
        filepath,
        fs.readFileSync(`${databasePath}/migration-template.ts`).toString(),
      ],
    ],
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({
    sequelize,
  }),
  logger: console,
});

export type Migration = typeof migrator._types.migration;
