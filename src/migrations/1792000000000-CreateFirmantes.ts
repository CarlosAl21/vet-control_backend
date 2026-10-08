import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFirmantes1792000000000 implements MigrationInterface {
    name = 'CreateFirmantes1792000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Report signers, scoped per company
        await queryRunner.query(`CREATE TABLE "firmante" ("id_firmante" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying(100) NOT NULL, "puesto" character varying(100) NOT NULL, "orden" integer NOT NULL, "id_empresa" uuid, CONSTRAINT "PK_a84f7fc8d83dab25b411ba8f42c" PRIMARY KEY ("id_firmante"))`);
        await queryRunner.query(`ALTER TABLE "firmante" ADD CONSTRAINT "FK_88497a8128e1a682fb27c47047e" FOREIGN KEY ("id_empresa") REFERENCES "empresa"("id_empresa") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "firmante" DROP CONSTRAINT "FK_88497a8128e1a682fb27c47047e"`);
        await queryRunner.query(`DROP TABLE "firmante"`);
    }
}
