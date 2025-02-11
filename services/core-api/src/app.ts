import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gameRoutes from "./routes/gameRoutes";
import {GameController} from "./controllers/gameController";
import "reflect-metadata"


import { PlaylistService } from './services/playlistService';
import {DataSource} from "typeorm";
import {Answer, Game, Question, Track} from "./models/Game";
import tracksRoutes from "./routes/tracksRoutes";

dotenv.config();
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT||"5432"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true,
    logging: false,
    entities: [Game,Track,Question,Answer],
    subscribers: [],
    migrations: [],
})

AppDataSource.initialize()
    .then(() => {
        console.log("DB connected")
    })
    .catch((error) => console.log(error))
const gameRespository = AppDataSource.getRepository(Game);
const app = express();
const playlistService = new PlaylistService();
const gameController = new GameController(playlistService,gameRespository);
let origin = process.env.TS_NODE_DEV?"*":'https://multitunes.app';
app.use(cors({ origin: origin}));
app.use(express.json());
app.use('/api/game', gameRoutes(gameController));
app.use('/api/tracks',tracksRoutes(AppDataSource.getRepository(Track)))
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});
const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`Server running on port ${port}`));
export default app;
