import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTrackSource1739352816556 implements MigrationInterface {
    name = 'AddTrackSource1739352816556'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "track_source" ("id" integer NOT NULL, "source" character varying NOT NULL, "url" character varying NOT NULL, "trackId" bigint, CONSTRAINT "REL_a0f044f079d46f7cd6f07e4820" UNIQUE ("trackId"), CONSTRAINT "PK_c8bba67e441371ad04c5c1a6a7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "track_source" ADD CONSTRAINT "FK_a0f044f079d46f7cd6f07e4820d" FOREIGN KEY ("trackId") REFERENCES "track"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
         await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "track_source_id_seq" OWNED BY "track_source"."id"`);
        await queryRunner.query(`ALTER TABLE "track_source" ALTER COLUMN "id" SET DEFAULT nextval('"track_source_id_seq"')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "track_source" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "track_source_id_seq"`);
        await queryRunner.query(`ALTER TABLE "track_source" DROP CONSTRAINT "FK_a0f044f079d46f7cd6f07e4820d"`);
        await queryRunner.query(`DROP TABLE "track_source"`);
    }

}
