import { MigrationInterface, QueryRunner } from "typeorm";

export class FixDetalleHistorialTextFields1781115157646 implements MigrationInterface {
    name = 'FixDetalleHistorialTextFields1781115157646'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // lotes: unique constraint (idempotent)
        const constraintExists = await queryRunner.query(
            `SELECT 1 FROM pg_constraint WHERE conname = 'UQ_3b60a4e4c7e4ac0510a01232ae2'`
        );
        if (!constraintExists.length) {
            await queryRunner.query(`ALTER TABLE "lotes" ADD CONSTRAINT "UQ_3b60a4e4c7e4ac0510a01232ae2" UNIQUE ("codigo_lote")`);
        }

        // lotes: estado varchar → enum (idempotent)
        const lotesEnumExists = await queryRunner.query(
            `SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE t.typname = 'lotes_estado_enum' AND n.nspname = 'vetcontrolbd'`
        );
        if (!lotesEnumExists.length) {
            await queryRunner.query(`ALTER TABLE "lotes" DROP COLUMN "estado"`);
            await queryRunner.query(`CREATE TYPE "vetcontrolbd"."lotes_estado_enum" AS ENUM('activo', 'inactivo', 'vencido', 'agotado')`);
            await queryRunner.query(`ALTER TABLE "lotes" ADD "estado" "vetcontrolbd"."lotes_estado_enum" NOT NULL DEFAULT 'activo'`);
        }

        // detalle_factura / facturas: decimal precision (safe ALTER TYPE)
        await queryRunner.query(`ALTER TABLE "detalle_factura" ALTER COLUMN "precio_unitario" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "detalle_factura" ALTER COLUMN "subtotal" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "facturas" ALTER COLUMN "total" TYPE numeric(10,2)`);

        // detalle_historial: varchar(255) → text (safe ALTER TYPE, no data loss)
        await queryRunner.query(`ALTER TABLE "detalle_historial" ALTER COLUMN "diagnostico" TYPE text`);
        await queryRunner.query(`ALTER TABLE "detalle_historial" ALTER COLUMN "tratamiento" TYPE text`);
        await queryRunner.query(`ALTER TABLE "detalle_historial" ALTER COLUMN "observaciones" TYPE text`);

        // historiales_medico: varchar → date and varchar(50) → varchar(500)
        await queryRunner.query(`ALTER TABLE "historiales_medico" ALTER COLUMN "fecha" TYPE date USING "fecha"::date`);
        await queryRunner.query(`ALTER TABLE "historiales_medico" ALTER COLUMN "diagnostico" TYPE character varying(500)`);

        // mascota: varchar → date and drop not null on microchip
        await queryRunner.query(`ALTER TABLE "mascota" ALTER COLUMN "fecha_nacimiento" TYPE date USING "fecha_nacimiento"::date`);
        await queryRunner.query(`ALTER TABLE "mascota" ALTER COLUMN "num_microchip_collar" DROP NOT NULL`);

        // cita: estado varchar → enum (idempotent)
        const citaEnumExists = await queryRunner.query(
            `SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE t.typname = 'cita_estado_enum' AND n.nspname = 'vetcontrolbd'`
        );
        if (!citaEnumExists.length) {
            await queryRunner.query(`ALTER TABLE "cita" DROP COLUMN "estado"`);
            await queryRunner.query(`CREATE TYPE "vetcontrolbd"."cita_estado_enum" AS ENUM('Pendiente', 'Programada', 'Completada', 'Cancelada')`);
            await queryRunner.query(`ALTER TABLE "cita" ADD "estado" "vetcontrolbd"."cita_estado_enum" NOT NULL DEFAULT 'Pendiente'`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cita" DROP COLUMN "estado"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "vetcontrolbd"."cita_estado_enum"`);
        await queryRunner.query(`ALTER TABLE "cita" ADD "estado" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mascota" ALTER COLUMN "num_microchip_collar" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mascota" ALTER COLUMN "fecha_nacimiento" TYPE character varying(50)`);
        await queryRunner.query(`ALTER TABLE "historiales_medico" ALTER COLUMN "diagnostico" TYPE character varying(50)`);
        await queryRunner.query(`ALTER TABLE "historiales_medico" ALTER COLUMN "fecha" TYPE character varying(50)`);
        await queryRunner.query(`ALTER TABLE "detalle_historial" ALTER COLUMN "observaciones" TYPE character varying(255)`);
        await queryRunner.query(`ALTER TABLE "detalle_historial" ALTER COLUMN "tratamiento" TYPE character varying(255)`);
        await queryRunner.query(`ALTER TABLE "detalle_historial" ALTER COLUMN "diagnostico" TYPE character varying(255)`);
        await queryRunner.query(`ALTER TABLE "facturas" ALTER COLUMN "total" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "detalle_factura" ALTER COLUMN "subtotal" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "detalle_factura" ALTER COLUMN "precio_unitario" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "lotes" DROP COLUMN "estado"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "vetcontrolbd"."lotes_estado_enum"`);
        await queryRunner.query(`ALTER TABLE "lotes" ADD "estado" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "lotes" DROP CONSTRAINT IF EXISTS "UQ_3b60a4e4c7e4ac0510a01232ae2"`);
    }
}
