import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gameRoutes from "./routes/gameRoutes";
import {GameController} from "./controllers/gameController";
import redis from "./config/redis";
import { PlaylistService } from './services/playlistService';
import {AudioProcessingService} from "./services/audioProcessingService";

dotenv.config();
const app = express();
const playlistService = new PlaylistService(redis);
const audioProcessingService = new AudioProcessingService(redis);
const gameController = new GameController(redis,playlistService,audioProcessingService);

app.use(cors());
app.use(express.json());
app.use('/api/game', gameRoutes(gameController));
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});
const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`Server running on port ${port}`));
export default app;
