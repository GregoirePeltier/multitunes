import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPreviousGameView1739645699816 implements MigrationInterface {
    name = 'AddPreviousGameView1739645699816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "track_quiz_audio" DROP CONSTRAINT "FK_4a43f8da641bc73e08da24fc637"`);
        await queryRunner.query(`ALTER TABLE "track_quiz_audio" ALTER COLUMN "questionId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "track_quiz_audio" ADD CONSTRAINT "FK_4a43f8da641bc73e08da24fc637" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE VIEW "previous_game_view" AS 
        SELECT 
            g.id as game_id,
            (
                SELECT id 
                FROM game prev 
                WHERE prev.genre = g.genre 
                AND prev.date < g.date 
                ORDER BY prev.date DESC 
                LIMIT 1
            ) as previous_game_id
        FROM game g
    `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","previous_game_view","SELECT \n            g.id as game_id,\n            (\n                SELECT id \n                FROM game_entity prev \n                WHERE prev.genre = g.genre \n                AND prev.date < g.date \n                ORDER BY prev.date DESC \n                LIMIT 1\n            ) as previous_game_id\n        FROM game_entity g"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","previous_game_view","public"]);
        await queryRunner.query(`DROP VIEW "previous_game_view"`);
        await queryRunner.query(`ALTER TABLE "track_quiz_audio" DROP CONSTRAINT "FK_4a43f8da641bc73e08da24fc637"`);
        await queryRunner.query(`ALTER TABLE "track_quiz_audio" ALTER COLUMN "questionId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "track_quiz_audio" ADD CONSTRAINT "FK_4a43f8da641bc73e08da24fc637" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
