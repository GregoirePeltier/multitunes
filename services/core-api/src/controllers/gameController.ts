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

    async createGame(options?:{genreId:number}): Promise<Game> {
        const genreId = options?.genreId;
        // Generate new playlist
        const gameId = crypto.randomUUID();
        let tracks = await this.playlistService.generatePlaylist({styleId: genreId});
        tracks = Utils.shuffleArray(tracks);

        let playlist = tracks.slice(0, 5);
        let anyTrack = Array.from(await this.playlistService.getAvailableTrackIds());
        let availables = tracks.slice(5).map(t => t.id);
        while (availables.length <=20) {
            availables.push(anyTrack[randomInt(0, anyTrack.length)]);
        }
        let picked = new Set(playlist.map(t => t.id));
        // Store game state
        const questions: Question[] = await Promise.all(playlist.map(async (t) => {
            let other = [t.id]
            while (other.length < 5 && availables.length > 0) {
                let newValue = availables[randomInt(0, availables.length)];
                availables = availables.filter(id => id != newValue);
                if (!other.includes(newValue) && !picked.has(newValue)) {
                    picked.add(newValue);
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