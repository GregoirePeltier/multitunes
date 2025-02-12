import {Game, GameGenre} from "../models/Game";
import {Repository} from "typeorm";

export interface AvailableGame {
    id: number;
    date: string;
    genre?: GameGenre;
}

export class GameController {
    private gameRepository: Repository<Game>;

    constructor( gameRepository: Repository<Game>) {
        this.gameRepository = gameRepository;
    }

    async getGame(date: Date, genre?: GameGenre): Promise<Game | null> {
        return await this.gameRepository.findOne({
            where: { date, genre },
            relations: ['questions', 'questions.answers', 'questions.track']
        });
    }

    async getGameById(id: number): Promise<Game | null> {
        return await this.gameRepository.findOne({
            where: { id },
            relations: ['questions', 'questions.answers', 'questions.track']
        });
    }

    async getAvailableGames(): Promise<AvailableGame[]> {
        const games = await this.gameRepository
            .createQueryBuilder('game')
            .select(['game.id', 'game.date', 'game.genre'])
            .where('game.date <= :now', { now: new Date() })
            .orderBy('game.date', 'DESC')
            .limit(100)
            .getMany();

        return games.map(game => ({
            id: game.id,
            date: game.date.toISOString(),
            genre: game.genre
        }));
    }
}