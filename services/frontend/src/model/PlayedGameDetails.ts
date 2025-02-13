import {GameGenre} from "../services/GameService.ts";

export interface PlayedGameDetails {
    gameId: number;
    date: string;
    points: number[];
    score: number;
    genre: GameGenre;
}