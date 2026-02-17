import { MigrationInterface, QueryRunner } from "typeorm";

export class FixWorkSessionFks1770988193334 implements MigrationInterface {
    name = 'FixWorkSessionFks1770988193334'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_e6f6e60b98634422e89fb44e174"`);
        await queryRunner.query(`ALTER TABLE "work_sessions" DROP CONSTRAINT "FK_a7a790065ee6b574355dc15f61d"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_e6f6e60b98634422e89fb44e174" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "work_sessions" ADD CONSTRAINT "FK_a7a790065ee6b574355dc15f61d" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "work_sessions" DROP CONSTRAINT "FK_a7a790065ee6b574355dc15f61d"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_e6f6e60b98634422e89fb44e174"`);
        await queryRunner.query(`ALTER TABLE "work_sessions" ADD CONSTRAINT "FK_a7a790065ee6b574355dc15f61d" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_e6f6e60b98634422e89fb44e174" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
