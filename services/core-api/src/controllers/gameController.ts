import {Answer, Game, Question} from "../models/Game";
import {Between, Repository} from "typeorm";
import {PreviousGameView} from "../models/previousGameId";
import {AppDataSourceConfig} from "../appDataSource.config";
import {Utils} from "../utils";
import {QuizAudioStartTimes, StemType, Track, TrackQuizAudio} from "../models/Track";
import {GameGenre} from "../models/GameGenre";
import {AudioTaskService} from "../services/taskService";

export interface AvailableGame {
    id: number;
    date: string;
    genre?: GameGenre;
}

export class GameController {
    private gameRepository: Repository<Game>;


    constructor( gameRepository: Repository<Game>,
                 private previousGameRepository: Repository<PreviousGameView>,
                 private taskService: AudioTaskService,
                 private trackRepository: Repository<Track>,
                 private audioRepository: Repository<TrackQuizAudio>) {
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
    async getGamesInRange(startDate: Date, endDate: Date, gameGenre:GameGenre): Promise<Game[]> {
        return await this.gameRepository.find({
            where: {
                genre: gameGenre,
                date: Between(startDate, endDate),
            },
            order: {
                date: 'ASC',
            },
            relations: ['questions', 'questions.answers', 'questions.track']
        });
    }
    async generateGame(date: Date, gameGenre: GameGenre):Promise<Game> {
        const existing = await this.getGame(date, gameGenre);
        if (existing) {
            throw new Error('Game for genre and date exists');
        }
        /// We get the games that are around the required date, to maintain the limit on when a possible answer should be repeted
        let startDate = new Date(date);
        startDate.setDate(startDate.getDate() - 5);
        let endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 5);
        const gamesInRange = await this.getGamesInRange(startDate, endDate, gameGenre);
        const fiveDayRangeAnswers = gamesInRange.flatMap(game => game.questions.flatMap(question => question.answers)).map(answer => answer.id);
        startDate.setDate(date.getDate() - 30);
        endDate.setDate(date.getDate() + 30);
        let thirtyDayRangeGames = await this.getGamesInRange(startDate, endDate, gameGenre);
        let thirtyDayRangeAnswers =thirtyDayRangeGames.flatMap(game=>game.questions.map(question=>question.track)).map(track=>track.id);

        const trackRepository = this.trackRepository;
        const availableTracks = (await trackRepository
        .createQueryBuilder('track')
        .innerJoin('track.genres', 'trackGenre')
        .where('trackGenre.genre = :genre', { genre:gameGenre })
        .getMany());
        const trackIds = availableTracks.map(record => record.id as number);

        let availableAnswers = trackIds.filter(trackId => !thirtyDayRangeAnswers.includes(trackId));
        let availablePropositions = trackIds.filter(trackId => !fiveDayRangeAnswers.includes(trackId));

        availablePropositions = Utils.shuffleArray(availablePropositions);
        availableAnswers = Utils.shuffleArray(availableAnswers);

        if(availableAnswers.length<5){
            throw new Error('Not enough possible answers to generate a game');
        }
        // We pick five tracks to be the answers
        const pickedAnswers = availableAnswers.slice(0,5);
        availablePropositions = availablePropositions.filter(trackId => !pickedAnswers.includes(trackId));
        if(availablePropositions.length<20){
            throw new Error('Not enough possible propositions to generate a game');
        }

        const game = new Game()
        game.genre = gameGenre;
        game.date = date;
        game.questions = [];

        for (let i = 0; i < 5; i++) {
            let id = pickedAnswers[i];
            const track = await trackRepository.findOneOrFail({where:{id: id}})
            const question = new Question();
            question.answers = [];
            question.track = track
            const answer = new Answer();
            answer.title = track.title;
            answer.id = track.id;
            question.answers.push(answer);
            for (let j = 0; j < 4; j++) {
                const track = await trackRepository.findOneOrFail({where:{id:availablePropositions[i * 4 + j]}})
                const answer = new Answer();
                answer.title = track.title;
                answer.id = track.id
                question.answers.push(answer);
            }
            game.questions.push(question);
        }
        await this.gameRepository.save(game);

        for (const question of game.questions) {
            const existingAudio = await this.audioRepository.findOne({
                where:{track:question.track}
            })
            let newAudio = new TrackQuizAudio();
            newAudio.track = question.track;
            newAudio.question = question;
            newAudio.audioUrl = existingAudio?.audioUrl ?? '';
            newAudio.prepared = existingAudio?.prepared ?? false;
            newAudio.audioTreatmentVersion = 1;
            newAudio.quizAudioStartTimes = this.generateDefaultStartTimes()
            newAudio = await this.audioRepository.save(newAudio);
            if(!existingAudio || !existingAudio.prepared){
                await this.taskService.processAudio(newAudio.id);
            }
        }
        return game;
    }

    private generateDefaultStartTimes() {
        const pianoStart = new QuizAudioStartTimes();
        pianoStart.startTime = 0
        pianoStart.stem = StemType.PIANO
        const otherStart = new QuizAudioStartTimes();
        otherStart.startTime = 0
        otherStart.stem = StemType.OTHER
        const bassStart = new QuizAudioStartTimes();
        bassStart.startTime = 5
        bassStart.stem = StemType.BASS
        let drumsStart = new QuizAudioStartTimes();
        drumsStart.startTime = 10
        drumsStart.stem = StemType.DRUMS
        let guitarStart = new QuizAudioStartTimes();
        guitarStart.startTime = 15
        guitarStart.stem = StemType.GUITAR
        const vocalsStart = new QuizAudioStartTimes();
        vocalsStart.startTime = 20
        vocalsStart.stem = StemType.VOCALS

        return [
            pianoStart,
            otherStart,
            bassStart,
            drumsStart,
            guitarStart,
            vocalsStart,
        ]
    }
}