import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTrackQuizAudio1739574967268 implements MigrationInterface {
    name = 'CreateTrackQuizAudio1739574967268'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "track_quiz_audio" ("id" SERIAL NOT NULL, "trackId" bigint NOT NULL, "prepared" boolean NOT NULL DEFAULT false, "audioUrl" character varying NOT NULL, "audioTreatmentVersion" integer NOT NULL, "questionId" integer, CONSTRAINT "REL_4a43f8da641bc73e08da24fc63" UNIQUE ("questionId"), CONSTRAINT "PK_9ae42d08a0bd79e4ff36e895746" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quiz_audio_start_times" ("trackQuizAudioId" integer NOT NULL, "stem" character varying NOT NULL, "startTime" integer NOT NULL, CONSTRAINT "PK_569d158204af8f813c4edcc347a" PRIMARY KEY ("trackQuizAudioId", "stem"))`);
        await queryRunner.query(`ALTER TABLE "track_quiz_audio" ADD CONSTRAINT "FK_dcc7f731ee55266d1e18440450d" FOREIGN KEY ("trackId") REFERENCES "track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "track_quiz_audio" ADD CONSTRAINT "FK_4a43f8da641bc73e08da24fc637" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz_audio_start_times" ADD CONSTRAINT "FK_383048289ade391ee2c92972f9e" FOREIGN KEY ("trackQuizAudioId") REFERENCES "track_quiz_audio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_audio_start_times" DROP CONSTRAINT "FK_383048289ade391ee2c92972f9e"`);
        await queryRunner.query(`ALTER TABLE "track_quiz_audio" DROP CONSTRAINT "FK_4a43f8da641bc73e08da24fc637"`);
        await queryRunner.query(`ALTER TABLE "track_quiz_audio" DROP CONSTRAINT "FK_dcc7f731ee55266d1e18440450d"`);
        await queryRunner.query(`DROP TABLE "quiz_audio_start_times"`);
        await queryRunner.query(`DROP TABLE "track_quiz_audio"`);
    }

}
