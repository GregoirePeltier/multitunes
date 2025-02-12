import { GameController } from '../gameController';
import { Game, GameGenre } from '../../models/Game';
import {QueryBuilder, Repository} from 'typeorm';
import Mock = jest.Mock;

// Create mock repository
const createMockRepository = () => ({
    findOne: jest.fn(),
    createQueryBuilder: jest.fn()
});
type MockGameRepository = {
    findOne: jest.MockedFn<Repository<Game>['findOne']>;
    createQueryBuilder: jest.MockedFn<Repository<Game>['createQueryBuilder']>;
};
describe('GameController', () => {
    let gameController: GameController;
    let mockGameRepository: MockGameRepository;

    beforeEach(() => {
        mockGameRepository = createMockRepository() as any;
        gameController = new GameController(mockGameRepository as any);
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
                where: { date: mockDate, genre: GameGenre.POP },
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
                where: { id: 1 },
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
                { id: 1, date: new Date('2024-01-01'), genre: GameGenre.POP },
                { id: 2, date: new Date('2024-01-02'), genre: GameGenre.ROCK }
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
            expect(mockQueryBuilder.limit).toHaveBeenCalledWith(100);
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
});
