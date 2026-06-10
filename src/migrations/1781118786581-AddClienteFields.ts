import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClienteFields1781118786581 implements MigrationInterface {
    name = 'AddClienteFields1781118786581'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add nullable first, backfill, then set NOT NULL
        await queryRunner.query(`ALTER TABLE "cliente" ADD "nombre" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "cliente" ADD "apellido" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "cliente" ADD "telefono" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "cliente" ADD "direccion" character varying(255)`);

        // Backfill existing rows from linked usuario
        await queryRunner.query(`
            UPDATE "cliente" c
            SET nombre = u.nombre, apellido = u.apellido, telefono = u.telefono, direccion = u.direccion
            FROM "usuario" u
            WHERE c.id_usuario = u.id_usuario
        `);

        // Fallback for rows without a linked usuario
        await queryRunner.query(`UPDATE "cliente" SET nombre = 'Sin nombre' WHERE nombre IS NULL`);
        await queryRunner.query(`UPDATE "cliente" SET apellido = 'Sin apellido' WHERE apellido IS NULL`);

        await queryRunner.query(`ALTER TABLE "cliente" ALTER COLUMN "nombre" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cliente" ALTER COLUMN "apellido" SET NOT NULL`);

        // Make id_usuario nullable (client can exist without a user account)
        await queryRunner.query(`ALTER TABLE "cliente" ALTER COLUMN "id_usuario" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cliente" ALTER COLUMN "id_usuario" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cliente" DROP COLUMN "direccion"`);
        await queryRunner.query(`ALTER TABLE "cliente" DROP COLUMN "telefono"`);
        await queryRunner.query(`ALTER TABLE "cliente" DROP COLUMN "apellido"`);
        await queryRunner.query(`ALTER TABLE "cliente" DROP COLUMN "nombre"`);
    }
}
