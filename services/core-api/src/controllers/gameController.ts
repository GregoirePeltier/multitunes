import {Answer, Game, GameGenre, Question} from "../models/Game";
import {Between, Repository} from "typeorm";
import {PreviousGameView} from "../models/previousGameId";
import {AppDataSourceConfig} from "../appDataSource.config";
import {Utils} from "../utils";
import {Track} from "../models/Track";

export interface AvailableGame {
    id: number;
    date: string;
    genre?: GameGenre;
}

export class GameController {
    private gameRepository: Repository<Game>;

    constructor( gameRepository: Repository<Game>,private previousGameRepository: Repository<PreviousGameView>) {
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
            .getMany();

        return games.map(game => ({
            id: game.id,
            date: game.date.toISOString(),
            genre: game.genre
        }));
    }
    async getPreviousGameId(game_id:number): Promise<number|null> {
        return (await this.previousGameRepository.findOne({where:{game_id}}))?.previous_game_id ?? null;
    }

    async generateGame(date: Date, gameGenre: GameGenre) {
        const existing = await this.getGame(date, gameGenre);
        if (existing) {
            throw new Error('Game for genre and date exists');
        }
        /// We get the games that are around the required date, to maintain the limit on when a possible answer should be repeted
        const startDate = new Date(date);
        startDate.setDate(startDate.getDate() - 5);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 5);
        const gamesInRange = await this.gameRepository.find({
            where: {
                genre: gameGenre,
                date: Between(startDate, endDate),
            },
            order: {
                date: 'ASC',
            },
            relations: ['questions', 'questions.answers', 'questions.track']
        });
        const fobiddenProposedAnswers = gamesInRange.flatMap(game => game.questions.flatMap(question => question.answers)).map(answer => answer.id);
        const validAnswerIds = await this.gameRepository
            .createQueryBuilder('game')
            .leftJoin('game.questions', 'questions')
            .leftJoin('questions.answers', 'answers')
            .select('answers.id')
            .where('game.genre = :genre', {genre: gameGenre})
            .andWhere('game.date BETWEEN :startDate AND :endDate', {startDate, endDate})
            .getRawMany();
        const forbiddenValidAnswers = validAnswerIds.map(record => record.id);

        const trackRepository = AppDataSourceConfig.getRepository(Track);
        const availableTracks = await trackRepository
            .createQueryBuilder('track')
            .select('track.id', 'trackId')
            .distinct(true)
            .getRawMany();
        const trackIds = availableTracks.map(record => record.trackId as number);
        const possibleAnswers = trackIds.filter(trackId => !fobiddenProposedAnswers.includes(trackId));
        const possibleRightAnswers = trackIds.filter(trackId => !fobiddenProposedAnswers.includes(trackId) && forbiddenValidAnswers.includes(trackId));
        Utils.shuffleArray(possibleAnswers)
        Utils.shuffleArray(possibleRightAnswers);
        const game = new Game()
        game.genre = gameGenre;
        game.date = date;
        game.questions = [];
        for (let i = 0; i < 5; i++) {
            const track = await trackRepository.findOneOrFail({where:{id:possibleRightAnswers[i]}})
            const question = new Question();
            question.answers = [];
            question.track = track
            const answer = new Answer();
            answer.title = track.title;
            answer.id = track.id;
            question.answers.push(answer);
            for (let j = 0; j < 4; j++) {
                const track = await trackRepository.findOneOrFail({where:{id:possibleAnswers[i * 4 + j]}})
                const answer = new Answer();
                answer.title = track.title;
                answer.id = track.id
                question.answers.push(answer);
            }
            game.questions.push(question);
        }
        await this.gameRepository.save(game);
        return game;
    }
}