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
    BLUES = 153
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
    questions: Array<Question>,
}

export class GameService {
    private apiUrl: string;

    constructor() {
        // Get API URL from environment variable, fallback to localhost if not set
        this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
    }

    /**
     * Creates or joins a new game session
     * @returns Promise<Game> A new game object
     * @throws Error if the API call fails
     */
    async getNewGame(genre?: GameGenre): Promise<Game> {
        try {
            const response = await axios.post<Game>(`${this.apiUrl}/game/create`,{genreId:genre});
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to create game: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }
}
