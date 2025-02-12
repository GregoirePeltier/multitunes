import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTrackSourceId1739359062204 implements MigrationInterface {
    name = 'AddTrackSourceId1739359062204'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_4fca41d8e56bd9afb8cdbefc22"`);
        await queryRunner.query(`ALTER TABLE "track_source" ADD "source_id" character varying NOT NULL default 'SHOULD BE UPDATED'`);
        await queryRunner.query(`ALTER TABLE "question" DROP CONSTRAINT "FK_34b43ddcf21541b060c121c84d0"`);
        await queryRunner.query(`ALTER TABLE "track_source" DROP CONSTRAINT "FK_a0f044f079d46f7cd6f07e4820d"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "track_id_seq" OWNED BY "track"."id"`);
        await queryRunner.query(`ALTER TABLE "track" ALTER COLUMN "id" SET DEFAULT nextval('"track_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "track_source" ADD CONSTRAINT "FK_a0f044f079d46f7cd6f07e4820d" FOREIGN KEY ("trackId") REFERENCES "track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question" ADD CONSTRAINT "FK_34b43ddcf21541b060c121c84d0" FOREIGN KEY ("trackId") REFERENCES "track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

          // Create track_source records for tracks that don't have them
        await queryRunner.query(`
            INSERT INTO track_source ("trackId", "source", "source_id","url")
            SELECT t.id, 'deezer', CAST(t.id AS VARCHAR),'SHOULD_HAVE_BEEN_UPDATED'
            FROM track t
                     LEFT JOIN track_source ts ON ts."trackId" = t.id
            WHERE ts."trackId" IS NULL
        `);

        // Update source_id for existing track_source records
        await queryRunner.query(`
            UPDATE track_source
            SET source_id = CAST(t.id AS VARCHAR)
                FROM track t
            WHERE t.id = track_source."trackId"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question" DROP CONSTRAINT "FK_34b43ddcf21541b060c121c84d0"`);
        await queryRunner.query(`ALTER TABLE "track_source" DROP CONSTRAINT "FK_a0f044f079d46f7cd6f07e4820d"`);
        await queryRunner.query(`ALTER TABLE "track" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "track_id_seq"`);
        await queryRunner.query(`ALTER TABLE "track_source" ADD CONSTRAINT "FK_a0f044f079d46f7cd6f07e4820d" FOREIGN KEY ("trackId") REFERENCES "track"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question" ADD CONSTRAINT "FK_34b43ddcf21541b060c121c84d0" FOREIGN KEY ("trackId") REFERENCES "track"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "track_source" DROP COLUMN "source_id"`);
        await queryRunner.query(`CREATE INDEX "IDX_4fca41d8e56bd9afb8cdbefc22" ON "track" ("title", "artist") `);
    }

}
