import {GameStatus, GameStatusValue} from "../models/Game";
import {Redis} from 'ioredis';

export class GameController {

    private redis: Redis;

    constructor(redis: Redis) {
        this.redis = redis;
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
        // Store game state
        await this.redis.set(`game:${gameId}`, JSON.stringify({
            status: GameStatusValue.INITIALIZING,
        }));
        return gameId;
    }

    async checkGameStatus(gameId: string): Promise<GameStatus> {
        return Promise.reject(new Error("Not implemented"));
    }
}