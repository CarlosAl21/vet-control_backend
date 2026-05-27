import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixEmailLength1748391600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "usuario" ALTER COLUMN "email" TYPE VARCHAR(254)`);
    await queryRunner.query(`ALTER TABLE "empresa" ALTER COLUMN "email" TYPE VARCHAR(254)`);
    await queryRunner.query(`ALTER TABLE "proveedor" ALTER COLUMN "email" TYPE VARCHAR(254)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "usuario" ALTER COLUMN "email" TYPE VARCHAR(50)`);
    await queryRunner.query(`ALTER TABLE "empresa" ALTER COLUMN "email" TYPE VARCHAR(100)`);
    await queryRunner.query(`ALTER TABLE "proveedor" ALTER COLUMN "email" TYPE VARCHAR(100)`);
  }
}
