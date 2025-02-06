import {GameStatus, GameStatusValue} from "../models/Game";
import {Redis} from 'ioredis';
import {PlaylistService} from "../services/playlistService";

export class GameController {

    private redis: Redis;
    private playlistService: PlaylistService;

    constructor(redis: Redis, playlistService: PlaylistService) {
        this.redis = redis;
        this.playlistService=playlistService;
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
        const playlist = await this.playlistService.generatePlaylist();
        // Store game state
        await this.redis.set(`game:${gameId}`, JSON.stringify({
            status: GameStatusValue.INITIALIZING,
            playlist,
        }));
        return gameId;
    }

    async checkGameStatus(gameId: string): Promise<GameStatus> {
        return Promise.reject(new Error("Not implemented"));
    }
}