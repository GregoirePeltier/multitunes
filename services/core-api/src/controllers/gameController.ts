import {Answer, Game, GameStatus, GameStatusValue, Question} from "../models/Game";
import {Redis} from 'ioredis';
import {PlaylistService} from "../services/playlistService";
import {Track} from "../models/track";
import {randomInt} from "node:crypto";
import {Utils} from "../utils";

export class GameController {

    private playlistService: PlaylistService;


    constructor(playlistService: PlaylistService) {
        this.playlistService = playlistService;
    }

    async createGame(): Promise<Game> {
        // Generate new playlist
        const gameId = crypto.randomUUID();
        const playlist = await this.playlistService.generatePlaylist({trackCount: 5});
        let availables = Array.from(await this.playlistService.getAvailableTrackIds());
        // Store game state
        const questions: Question[] = await Promise.all(playlist.map(async (t) => {
            let other = [t.id]

            while (other.length < 5) {
                let newValue = availables[randomInt(0, availables.length)];
                if (!other.includes(newValue)) {
                    other.push(newValue)
                }
            }
            let answers: Array<Answer> = await Promise.all(other.map(async (id) => {
                return {id, title: (await this.playlistService.getTrack(id)).title}
            }))
            answers = Utils.shuffleArray(answers)
            return {
                track: t,
                answers: answers
            }
        }))
        const game: Game = {
            questions: questions

        }
        return game;
    }

    async checkGameStatus(gameId: string): Promise<GameStatus> {
        return Promise.reject(new Error("Not implemented"));
    }
}