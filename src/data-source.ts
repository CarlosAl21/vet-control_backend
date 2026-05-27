import 'dotenv/config';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: (process.env.DB_TYPE as any) || 'postgres',
  host: process.env.DB_HOST,
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema: process.env.DB_SCHEMA,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  extra: {
    options: `-c search_path=${process.env.DB_SCHEMA}`,
  },
  synchronize: false,
});
