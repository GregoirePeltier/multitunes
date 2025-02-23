import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTrackGenre1740328299784 implements MigrationInterface {
    name = 'AddTrackGenre1740328299784'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","previous_game_view","public"]);
        await queryRunner.query(`DROP VIEW "previous_game_view"`);
        await queryRunner.query(`CREATE TABLE "track_genre" ("id" SERIAL NOT NULL, "genre" integer NOT NULL, CONSTRAINT "PK_062867c48d758b562a061aa09a3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "track_genres_track_genre" ("trackId" bigint NOT NULL, "trackGenreId" integer NOT NULL, CONSTRAINT "PK_dbcf52c1052c63b6b3deb7f1485" PRIMARY KEY ("trackId", "trackGenreId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b7215a3a6286c7c5a17b25bb3b" ON "track_genres_track_genre" ("trackId") `);
        await queryRunner.query(`CREATE INDEX "IDX_957aa8254e57b861bbe6cda7d2" ON "track_genres_track_genre" ("trackGenreId") `);
        await queryRunner.query(`ALTER TABLE "track_genres_track_genre" ADD CONSTRAINT "FK_b7215a3a6286c7c5a17b25bb3bc" FOREIGN KEY ("trackId") REFERENCES "track"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "track_genres_track_genre" ADD CONSTRAINT "FK_957aa8254e57b861bbe6cda7d27" FOREIGN KEY ("trackGenreId") REFERENCES "track_genre"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
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
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","previous_game_view","SELECT \n            g.id as game_id,\n            (\n                SELECT id \n                FROM game prev \n                WHERE prev.genre = g.genre \n                AND prev.date < g.date \n                ORDER BY prev.date DESC \n                LIMIT 1\n            ) as previous_game_id\n        FROM game g"]);


        const genres = await queryRunner.query(`
           SELECT DISTINCT g.genre AS genre, t.id AS trackId
            FROM game g
            INNER JOIN question q ON q."gameId" = g.id
            INNER JOIN answer a ON a."questionId" = q.id
            INNER JOIN track t ON a.id = t.id 
            where t.id is not null
        `);

        const genreInsertionMap = new Map<number, number>();
        const genresToInsert = new Set<number>();
        genres.forEach(({genre}:{genre:number}) => genresToInsert.add(genre));
        for (const genre of genresToInsert) {
            const result = await queryRunner.query(
                `INSERT INTO track_genre (genre) VALUES ($1) RETURNING id`,
                [genre]
            );
            genreInsertionMap.set(genre, result[0].id);
        }
console.log(genres);
        for (const {trackid, genre} of genres) {
            await queryRunner.query(
                `INSERT INTO track_genres_track_genre ("trackId", "trackGenreId") VALUES ($1, $2)`,
                [trackid, genreInsertionMap.get(genre)]
            );
        }
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","previous_game_view","public"]);
        await queryRunner.query(`DROP VIEW "previous_game_view"`);
        await queryRunner.query(`ALTER TABLE "track_genres_track_genre" DROP CONSTRAINT "FK_957aa8254e57b861bbe6cda7d27"`);
        await queryRunner.query(`ALTER TABLE "track_genres_track_genre" DROP CONSTRAINT "FK_b7215a3a6286c7c5a17b25bb3bc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_957aa8254e57b861bbe6cda7d2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b7215a3a6286c7c5a17b25bb3b"`);
        await queryRunner.query(`DROP TABLE "track_genres_track_genre"`);
        await queryRunner.query(`DROP TABLE "track_genre"`);
        await queryRunner.query(`CREATE VIEW "previous_game_view" AS SELECT 
            g.id as game_id,
            (
                SELECT id 
                FROM game prev 
                WHERE prev.genre = g.genre 
                AND prev.date < g.date 
                ORDER BY prev.date DESC 
                LIMIT 1
            ) as previous_game_id
        FROM game g`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","previous_game_view","SELECT \n            g.id as game_id,\n            (\n                SELECT id \n                FROM game_entity prev \n                WHERE prev.genre = g.genre \n                AND prev.date < g.date \n                ORDER BY prev.date DESC \n                LIMIT 1\n            ) as previous_game_id\n        FROM game_entity g"]);
    }

}
