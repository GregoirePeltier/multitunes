import {Track} from "../model/Track.ts";
import axios from "axios";

export enum GameStatusValue{
    ACTIVE="active",
    ENDED="ended",
    INITIALIZING="initializing",
}
export interface GameStatus{
    status:GameStatusValue,
    players:number
}
export interface Answer{
    id:number;
    title:string;
}
export interface Question{
    track:Track,
    answers : Array<Answer>,
}
export interface Game{
    questions:Array<Question>,
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
  async getNewGame(): Promise<Game> {
    try {
      const response = await axios.get<Game>(`${this.apiUrl}/game/create`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to create game: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }
}
