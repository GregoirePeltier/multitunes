import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gameRoutes from "./routes/gameRoutes";
import {GameController} from "./controllers/gameController";
import "reflect-metadata"
import {Game} from "./models/Game";
import tracksRoutes from "./routes/tracksRoutes";

import {QuizAudioStartTimes, Track, TrackQuizAudio} from "./models/Track";
import {AppDataSourceConfig} from "./appDataSource.config";
import {TrackSource} from "./models/TrackSource";
import {trackQuizAudioRoutes} from "./routes/quizzAudioRoutes";
import {TrackQuizAudioController} from "./controllers/trackQuizAudioController";

dotenv.config({path:process.env.ENV_FILE||".env"});

AppDataSourceConfig.initialize()
    .then(() => {
        console.log("DB connected")
    })
    .catch((error) => console.log(error))
const gameRespository = AppDataSourceConfig.getRepository(Game);
const app = express();
const gameController = new GameController(gameRespository);
const trackQuizzAudioController = new TrackQuizAudioController(AppDataSourceConfig.getRepository(TrackQuizAudio),AppDataSourceConfig.getRepository(QuizAudioStartTimes))
let origin = process.env.TS_NODE_DEV?"*":'https://multitunes.app';
if(!process.env.JWT_SECRET)
{
    console.error("JWT_SECRET not set");
    throw new Error("JWT_SECRET not set");
}
app.use(cors({ origin: origin}));
app.use(express.json());
app.use('/api/game', gameRoutes(gameController));
app.use('/api/tracks',tracksRoutes(AppDataSourceConfig.getRepository(Track),AppDataSourceConfig.getRepository(TrackSource)))
app.use('/api/trackaudios',trackQuizAudioRoutes(trackQuizzAudioController))
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});
const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`Server running on port ${port}`));
export default app;
