import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsuarioTokenVersion1791478250206 implements MigrationInterface {
    name = 'AddUsuarioTokenVersion1791478250206'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Session version used to revoke issued JWTs (logout, password change/reset)
        await queryRunner.query(`ALTER TABLE "usuario" ADD "token_version" integer NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuario" DROP COLUMN "token_version"`);
    }
}
