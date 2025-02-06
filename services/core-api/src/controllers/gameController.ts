import {GameStatus, GameStatusValue} from "../models/Game";
import {Redis} from 'ioredis';
import {PlaylistService} from "../services/playlistService";
import {AudioProcessingService} from "../services/audioProcessingService";

export class GameController {

    private redis: Redis;
    private playlistService: PlaylistService;
    private audioProcessingService: AudioProcessingService;

    constructor(redis: Redis, playlistService: PlaylistService,audioProcessingService: AudioProcessingService) {
        this.redis = redis;
        this.playlistService=playlistService;
        this.audioProcessingService = audioProcessingService;
    }

    async getOrCreateMainGame(): Promise<string> {
        const mainGame = await this.redis.get("game:main");
        if (mainGame) {
            return mainGame;
        }
        const newMainGameId = await this.createGame();
        await this.redis.set("game:main", newMainGameId);
        return newMainGameId
    }

    async createGame(): Promise<string> {
        // Generate new playlist
        const gameId = crypto.randomUUID();
        const playlist = await this.playlistService.generatePlaylist({trackCount:5});
        let processingJobs = await Promise.all(playlist.map(async track => {
            return await this.audioProcessingService.submitTrack(track);
        }))
        // Store game state
        await this.redis.set(`game:${gameId}`, JSON.stringify({
            status: GameStatusValue.INITIALIZING,
            playlist,
            processingJobs,
        }));
        return gameId;
    }

    async checkGameStatus(gameId: string): Promise<GameStatus> {
        return Promise.reject(new Error("Not implemented"));
    }
}