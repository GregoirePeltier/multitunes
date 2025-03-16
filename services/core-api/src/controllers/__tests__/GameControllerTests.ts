import {GameController} from '../gameController';
import {Game} from '../../models/Game';
import {Between, QueryBuilder, Repository} from 'typeorm';
import Mock = jest.Mock;
import {GameGenre} from "../../models/GameGenre";
import {Track} from "../../models/Track";

// Create mock repository
const createMockRepository = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
    save: jest.fn(),
});
type MockGameRepository = {
    findOne: jest.MockedFn<Repository<Game>['findOne']>;
    find: jest.MockedFn<Repository<Game>['find']>;
    createQueryBuilder: jest.MockedFn<Repository<Game>['createQueryBuilder']>;
    save: jest.MockedFn<Repository<Game>['save']>;
};

// Create mock service
const createMockTaskService = () => ({
    processAudio: jest.fn()
});

type MockAudioTaskService = {
    processAudio: jest.MockedFunction<(audioId: number) => Promise<void>>;
};
const createMockPreviousGameRepository = () => ({
    findOne: jest.fn()
});
type MockPreviousGameRepository = {
    findOne: jest.MockedFn<Repository<Game>['findOne']>;
};

// Create mock repository for Track
const createMockTrackRepository = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
    findOneOrFail: jest.fn()
});

type MockTrackRepository = {
    findOne: jest.MockedFn<Repository<Track>['findOne']>;
    find: jest.MockedFn<Repository<Track>['find']>;
    findOneOrFail: jest.MockedFn<Repository<Track>['findOneOrFail']>;
    createQueryBuilder: jest.MockedFn<Repository<Track>['createQueryBuilder']>;
};
// Create mock repository for audioQuizz
const createMockAudioRepository = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
    findOneOrFail: jest.fn(),
    save: jest.fn(),
});

type MockAudioQuizzRepository = {
    findOne: jest.MockedFn<Repository<Track>['findOne']>;
    find: jest.MockedFn<Repository<Track>['find']>;
    findOneOrFail: jest.MockedFn<Repository<Track>['findOneOrFail']>;
    createQueryBuilder: jest.MockedFn<Repository<Track>['createQueryBuilder']>;
    save: jest.MockedFn<Repository<Track>['save']>;
};


describe('GameController', () => {
    let gameController: GameController;
    let mockGameRepository: MockGameRepository;
    let mockPreviousGameRepository: MockPreviousGameRepository
    let mockAudioTaskService: MockAudioTaskService;
    let mockTrackRepository: MockTrackRepository;
    let mockQuizzAudioRepository: MockAudioQuizzRepository;
    beforeEach(() => {
        mockGameRepository = createMockRepository() as any;
        mockPreviousGameRepository = createMockPreviousGameRepository() as any;
        mockAudioTaskService = createMockTaskService();
        mockTrackRepository = createMockTrackRepository() as any;
        mockQuizzAudioRepository = createMockAudioRepository() as any;
        gameController = new GameController(mockGameRepository as any
            , mockPreviousGameRepository as any,
            mockAudioTaskService as any,
            mockTrackRepository as any,
            mockQuizzAudioRepository as any,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getGame', () => {
        it('should return a game when found', async () => {
            const mockDate = new Date();
            const mockGame = new Game();
            mockGame.id = 1;
            mockGame.date = mockDate;
            mockGame.genre = GameGenre.POP;

            mockGameRepository.findOne.mockResolvedValue(mockGame);

            const result = await gameController.getGame(mockDate, GameGenre.POP);

            expect(result).toEqual(mockGame);
            expect(mockGameRepository.findOne).toHaveBeenCalledWith({
                where: {date: mockDate, genre: GameGenre.POP},
                relations: ['questions', 'questions.answers', 'questions.track']
            });
        });

        it('should return null when game is not found', async () => {
            mockGameRepository.findOne.mockResolvedValue(null);

            const result = await gameController.getGame(new Date());

            expect(result).toBeNull();
        });
    });

    describe('getGameById', () => {
        it('should return a game when found by id', async () => {
            const mockGame = new Game();
            mockGame.id = 1;

            mockGameRepository.findOne.mockResolvedValue(mockGame);

            const result = await gameController.getGameById(1);

            expect(result).toEqual(mockGame);
            expect(mockGameRepository.findOne).toHaveBeenCalledWith({
                where: {id: 1},
                relations: ['questions', 'questions.answers', 'questions.track']
            });
        });

        it('should return null when game is not found by id', async () => {
            mockGameRepository.findOne.mockResolvedValue(null);

            const result = await gameController.getGameById(999);

            expect(result).toBeNull();
        });
    });

    describe('getAvailableGames', () => {
        it('should return available games', async () => {
            const mockGames = [
                {id: 1, date: new Date('2024-01-01'), genre: GameGenre.POP},
                {id: 2, date: new Date('2024-01-02'), genre: GameGenre.ROCK}
            ];

            const mockQueryBuilder = {
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(mockGames)
            };

            mockGameRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

            const result = await gameController.getAvailableGames();

            expect(result).toEqual(mockGames.map(game => ({
                id: game.id,
                date: game.date.toISOString(),
                genre: game.genre
            })));

            expect(mockGameRepository.createQueryBuilder).toHaveBeenCalledWith('game');
            expect(mockQueryBuilder.select).toHaveBeenCalledWith(['game.id', 'game.date', 'game.genre']);
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('game.date <= :now', expect.any(Object));
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('game.date', 'DESC');
        });


        it('should return empty array when no games are available', async () => {
            const mockQueryBuilder = {
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([])
            };

            mockGameRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

            const result = await gameController.getAvailableGames();

            expect(result).toEqual([]);
        });
    });
    describe("GenerateGames", () => {
        const allTracks = Array.from({length: 30}, (_, i) => ({
            id: i + 1,
            title: `track${i + 1}`,
            genre: GameGenre.POP
        }))
        let mockGameQueryBuilder: any
        let mockTrackQueryBuilder: any
        beforeEach(() => {
            mockTrackRepository.findOneOrFail = jest.fn().mockImplementation((arg: { where: { id: number } }) => {
                const value = allTracks.find(track => track.id === arg.where.id)
                if (value === undefined) {
                    throw new Error("Track not found")
                }
                return value
            })
            let nextAudioId = 1;
            mockQuizzAudioRepository.save.mockImplementation((entity: any) => {
                return {...entity, id: nextAudioId++}
            })

            mockGameQueryBuilder = {
                leftJoin: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue([]),
            };
            mockGameRepository.createQueryBuilder.mockReturnValue(mockGameQueryBuilder as any);

            mockGameRepository.find.mockResolvedValue([])

            mockTrackQueryBuilder = {
                innerJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(allTracks),
            }
            mockTrackRepository.createQueryBuilder.mockReturnValue(mockTrackQueryBuilder as any);


        })
        it('should throw error if game already exists for date and genre', async () => {
            const testDate = new Date('2024-03-20');
            const testGenre = GameGenre.POP;

            mockGameRepository.findOne.mockResolvedValue({
                id: 1,
                date: testDate,
                genre: testGenre,
            } as Game);

            await expect(gameController.generateGame(testDate, testGenre))
                .rejects
                .toThrow('Game for genre and date exists');
        });

        it('should query games in 5-day range', async () => {
            const testDate = new Date('2024-03-20');
            const testGenre = GameGenre.POP;

            // Mock that no existing game exists
            mockGameRepository.findOne.mockResolvedValue(null);

            // Mock the find method for 5-day range
            mockGameRepository.find.mockResolvedValue([]);

            // Mock the queryBuilder for 30-day range
            const mockGameQueryBuilder = {
                leftJoin: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue([]),
                innerJoin: jest.fn().mockReturnThis(),
            };

            mockGameRepository.createQueryBuilder.mockReturnValue(mockGameQueryBuilder as any);

            const mockTrackQueryBuilder = {
                innerJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(allTracks),
            }
            mockTrackRepository.createQueryBuilder.mockReturnValue(mockTrackQueryBuilder as any);

            await gameController.generateGame(testDate, testGenre);

            // Verify 5-day range query
            expect(mockGameRepository.find).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    genre: testGenre,
                    date: expect.any(Object), // Between clause
                },
                order: {
                    date: 'ASC',
                },
                relations: ['questions', 'questions.answers', 'questions.track']
            }));
        });

        it('should query games in 30-day range', async () => {
            const testDate = new Date('2024-03-20');
            const testGenre = GameGenre.POP;
            const expectedStartDate = new Date('2024-02-19');
            const expectedEndDate = new Date('2024-04-18T23:00:00Z');
            mockGameRepository.findOne.mockResolvedValue(null);
            mockGameRepository.find.mockResolvedValue([]);

            await gameController.generateGame(testDate, testGenre);
            expect(mockGameRepository.find).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    genre: testGenre,
                }),
            }))
            expect(mockGameRepository.find).toHaveBeenCalledWith(expect.objectContaining({
                where:expect.objectContaining({
                date: Between(expectedStartDate, expectedEndDate),

                })
            }))
        });
        it('should throw if not enough valid answers are available', async () => {
            const testDate = new Date('2024-03-20');
            const testGenre = GameGenre.POP;
            mockTrackQueryBuilder.getMany.mockReturnValue(allTracks.filter((_, i) => i % 5 == 0) as any);
            let mockedGames = Array.from({length: 5}, (_, gameIndex) => ({
                questions: Array.from({length: 5}, (_, questionIndex) => (
                    {
                        id: gameIndex * 5 + questionIndex,
                        track: allTracks[gameIndex * 5 + questionIndex],
                        answers: allTracks.slice(gameIndex * 5, gameIndex * 5 + 5)
                    }))
            }));
            mockGameRepository.find.mockResolvedValue(
                mockedGames as any);
            await expect(gameController.generateGame(testDate, testGenre))
                .rejects
                .toThrow('Not enough possible answers');
        })
        it('should throw if not enough possible answers are available', async () => {
            const testDate = new Date('2024-03-20');
            const testGenre = GameGenre.POP;
            let mockedGames = Array.from({length: 5}, (_, gameIndex) => ({
                questions: Array.from({length: 5}, (_, questionIndex) => (
                    {
                        id: gameIndex * 5 + questionIndex,
                        track: allTracks[gameIndex * 5 + questionIndex],
                        answers: allTracks.slice(gameIndex * 5, gameIndex * 5 + 5)
                    }))
            }));
            mockGameRepository.find.mockResolvedValue(
                mockedGames as any);
            await expect(gameController.generateGame(testDate, testGenre))
                .rejects
                .toThrow('Not enough possible propositions to generate a game');
        })
        it("Should pick 5 tracks at random from the available tracks", async () => {
            // This is a test on the random capabilities of the generation
            // This test can't really be made iron clad, as the random factors might always generate the same tracks 100 time in a row
            // But if it does, this is reasonable something to examine
            const testDate = new Date('2025-03-20');
            const testGenre = GameGenre.POP;
            const firstGame = await gameController.generateGame(testDate, testGenre);
            const firstGameAnswers = firstGame.questions.flatMap(question => question.track).map(track => track.id);
            let attemps = 100;
            let secondGameAnswers = firstGameAnswers;
            console.log(firstGameAnswers, secondGameAnswers);
            while (firstGameAnswers.filter((v) => secondGameAnswers.includes(v)).length != 0 && attemps > 0) {
                let secondGame = await gameController.generateGame(testDate, testGenre);
                secondGameAnswers = secondGame.questions.flatMap(question => question.track).map(track => track.id);
                console.log(firstGameAnswers.filter((v) => secondGameAnswers.includes(v)));
                attemps--;
            }
            expect(attemps).toBeGreaterThan(0);
            expect(firstGameAnswers.filter((v) => secondGameAnswers.includes(v))).toHaveLength(0);
        })
        it("Should trigger processing for unprocessed tracks",async()=>{
            const testDate = new Date('2025-03-20');
            const testGenre = GameGenre.POP;

            const game = await gameController.generateGame(testDate, testGenre);
            const answers = game.questions.flatMap(question => question.track).map(track => track.id);
            for (let answerId of answers) {
                expect(mockQuizzAudioRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                    track:expect.objectContaining( {id: answerId})
                }))
                const mockQuizzAudio = mockQuizzAudioRepository
                    .save.mock.results.find(result => (result.value as any).track.id === answerId)?.value as any
                expect(mockAudioTaskService.processAudio).toHaveBeenCalledWith(mockQuizzAudio.id)
            }
        })
    })
});
