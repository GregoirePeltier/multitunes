import {DataSource} from "typeorm";
import {Answer, Game, Question} from "./models/Game";
import {Track} from "./models/Track";
import dotenv from "dotenv";
import {AddTrackSource1739352816556} from "./migrations/1739352816556-AddTrackSource";
import {TrackSource} from "./models/TrackSource";
import {AddTrackSourceId1739359062204} from "./migrations/1739359062204-AddTrackSourceId";
import {UpdateForeignKey1739573727601} from "./migrations/1739573727601-UpdateForeignKey";


dotenv.config({path:process.env.ENV_FILE||".env"});

export const AppDataSourceConfig = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false,
    logging: process.env.NODE_ENV === "development",
    entities: [Game, Track, Question, Answer, TrackSource],
    migrations: [AddTrackSource1739352816556,AddTrackSourceId1739359062204,UpdateForeignKey1739573727601],
    subscribers: [],
    migrationsTableName: "migrations",
})