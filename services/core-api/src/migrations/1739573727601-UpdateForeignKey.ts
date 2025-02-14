import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateForeignKey1739573727601 implements MigrationInterface {
    name = 'UpdateForeignKey1739573727601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answer" DROP CONSTRAINT "FK_a4013f10cd6924793fbd5f0d637"`);
        await queryRunner.query(`ALTER TABLE "track_source" ALTER COLUMN "url" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "track_source" ALTER COLUMN "source_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "track_source" ALTER COLUMN "source_id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "answer" ADD CONSTRAINT "FK_a4013f10cd6924793fbd5f0d637" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answer" DROP CONSTRAINT "FK_a4013f10cd6924793fbd5f0d637"`);
        await queryRunner.query(`ALTER TABLE "track_source" ALTER COLUMN "source_id" SET DEFAULT 'SHOULD BE UPDATED'`);
        await queryRunner.query(`ALTER TABLE "track_source" ALTER COLUMN "source_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "track_source" ALTER COLUMN "url" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "answer" ADD CONSTRAINT "FK_a4013f10cd6924793fbd5f0d637" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
