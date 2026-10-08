import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeOptionalClinicalFieldsNullable1791900000000 implements MigrationInterface {
    name = 'MakeOptionalClinicalFieldsNullable1791900000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // mascota: tamano is optional in the UI
        await queryRunner.query(`ALTER TABLE "mascota" ALTER COLUMN "tamano" DROP NOT NULL`);

        // detalle_historial: vitals and clinical notes are optional in the UI
        await queryRunner.query(`ALTER TABLE "detalle_historial" ALTER COLUMN "peso_kg" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "detalle_historial" ALTER COLUMN "temperatura_c" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "detalle_historial" ALTER COLUMN "frecuencia_cardiaca" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "detalle_historial" ALTER COLUMN "frecuencia_respiratoria" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "detalle_historial" ALTER COLUMN "diagnostico" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "detalle_historial" ALTER COLUMN "tratamiento" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "detalle_historial" ALTER COLUMN "observaciones" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // SET NOT NULL fails if rows with NULL values were stored after up()
        await queryRunner.query(`ALTER TABLE "detalle_historial" ALTER COLUMN "observaciones" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "detalle_historial" ALTER COLUMN "tratamiento" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "detalle_historial" ALTER COLUMN "diagnostico" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "detalle_historial" ALTER COLUMN "frecuencia_respiratoria" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "detalle_historial" ALTER COLUMN "frecuencia_cardiaca" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "detalle_historial" ALTER COLUMN "temperatura_c" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "detalle_historial" ALTER COLUMN "peso_kg" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mascota" ALTER COLUMN "tamano" SET NOT NULL`);
    }
}
