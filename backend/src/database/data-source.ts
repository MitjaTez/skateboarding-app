import { join } from 'node:path';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

const root = import.meta.dirname;

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.SKATE_USERNAME,
  password: process.env.SKATE_PASSWORD,
  database: process.env.SKATE_DATABASE,
  logging: process.env.SKATEBOARD_LOGGING === 'true',
  entities: [join(root, '..', 'modules', 'entities', '*.entity.{ts,js}')],
  migrations: [join(root, 'migrations', '*.{ts,js}')],
  synchronize: false,
};

export default new DataSource(dataSourceOptions);
