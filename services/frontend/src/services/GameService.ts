import {Track} from "../model/Track.ts";
import axios from "axios";

export enum GameStatusValue {
    ACTIVE = "active",
    ENDED = "ended",
    INITIALIZING = "initializing",
}

export enum GameGenre {
    POP = 132,
    ROCK = 152,
    METAL = 464,
    RAP = 116,
    RNB = 165,
    FOLK = 466,
    COUNTRY = 84,
    FRENCH = 52,
    SOUL = 169,
    BLUES = 153,
    ALL=0,
}

export const GENRES = [
    GameGenre.POP,
    GameGenre.ROCK,
    GameGenre.METAL,
    GameGenre.RAP,
    GameGenre.RNB,
    GameGenre.FOLK,
    GameGenre.COUNTRY,
    GameGenre.FRENCH,
    GameGenre.SOUL,
    GameGenre.BLUES,
]

export interface GameStatus {
    status: GameStatusValue,
    players: number
}

export interface Answer {
    id: number;
    title: string;
}

export interface Question {
    track: Track,
    answers: Array<Answer>,
}

export interface Game {
    date: string,
    genre:GameGenre,
    questions: Array<Question>,
    id:number,
}

// GameService.ts
export interface AvailableGame {
    date: string;
    id: number;
    genre?: GameGenre;
}

export class GameService {
    private apiUrl: string;

    constructor() {
        this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
    }

    async getAvailableGames(): Promise<AvailableGame[]> {
        try {
            const response = await axios.get<AvailableGame[]>(`${this.apiUrl}/game/available`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to fetch available games: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }

    async getGameById(id: number): Promise<Game> {
        try {
            const response = await axios.get<Game>(`${this.apiUrl}/game/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to fetch game: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }

    async getDailyGame(genre?: GameGenre): Promise<Game> {
        try {
            const url = genre
                ? `${this.apiUrl}/game/daily/${genre}`
                : `${this.apiUrl}/game/daily`;
            const response = await axios.get<Game>(url);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to fetch daily game: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }
}

 export const getGameType = (genre:GameGenre) => {

            const genreNames = {
                [GameGenre.POP]: "Pop",
                [GameGenre.ROCK]: "Rock",
                [GameGenre.METAL]: "Metal",
                [GameGenre.RAP]: "Rap",
                [GameGenre.RNB]: "R&B",
                [GameGenre.FOLK]: "Folk",
                [GameGenre.COUNTRY]: "Country",
                [GameGenre.FRENCH]: "French",
                [GameGenre.SOUL]: "Soul",
                [GameGenre.BLUES]: "Blues",
                [GameGenre.ALL]: "General",
            };
            return genreNames[genre]||"";
    };