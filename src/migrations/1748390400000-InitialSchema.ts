import { MigrationInterface, QueryRunner } from 'typeorm';

// Baseline migration — DB was already in sync via synchronize:true.
// This entry exists only to anchor future incremental migrations.
export class InitialSchema1748390400000 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {}
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
