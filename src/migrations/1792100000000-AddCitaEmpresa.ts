import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCitaEmpresa1792100000000 implements MigrationInterface {
    name = 'AddCitaEmpresa1792100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Every cita belongs to a clinic (empresa); nullable for legacy rows
        await queryRunner.query(`ALTER TABLE "cita" ADD "id_empresa" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_250fe519cfd8cfff1f95802dd2" ON "cita" ("id_empresa") `);
        await queryRunner.query(`ALTER TABLE "cita" ADD CONSTRAINT "FK_250fe519cfd8cfff1f95802dd2e" FOREIGN KEY ("id_empresa") REFERENCES "empresa"("id_empresa") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Backfill only when unambiguous: the cita's usuario is cliente of exactly one empresa.
        // Ambiguous or unlinked citas stay NULL and are hidden from staff until reassigned.
        await queryRunner.query(`
            UPDATE "cita" ci
            SET "id_empresa" = owner."id_empresa"
            FROM (
                SELECT cl."id_usuario", MIN(cl."id_empresa"::text)::uuid AS "id_empresa"
                FROM "cliente" cl
                WHERE cl."id_usuario" IS NOT NULL AND cl."id_empresa" IS NOT NULL
                GROUP BY cl."id_usuario"
                HAVING COUNT(DISTINCT cl."id_empresa") = 1
            ) owner
            WHERE ci."id_usuario" = owner."id_usuario"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cita" DROP CONSTRAINT "FK_250fe519cfd8cfff1f95802dd2e"`);
        await queryRunner.query(`DROP INDEX "IDX_250fe519cfd8cfff1f95802dd2"`);
        await queryRunner.query(`ALTER TABLE "cita" DROP COLUMN "id_empresa"`);
    }
}
