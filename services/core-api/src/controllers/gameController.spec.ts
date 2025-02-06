import {GameController} from "../controllers/gameController";
import {Redis} from "ioredis";
import {GameStatusValue} from "../models/Game";
import {PlaylistService} from "../services/playlistService";

describe('Game Controller', () => {
    let controller: GameController
    let mockRedis: jest.Mocked<Redis>;
    let mockPlaylistService: jest.Mocked<PlaylistService>;

    beforeEach(() => {

        mockRedis = {
            get: jest.fn(),
            set: jest.fn(),
        } as any;
        mockPlaylistService = {
            generatePlaylist: jest.fn(),
        } as any;

        controller = new GameController(mockRedis, mockPlaylistService);
    });
    describe('getOrCreateMainGame', () => {

        it('should return the main game if existing', async () => {
            const mockGameId = '123';
            mockRedis.get.mockImplementationOnce((key) => Promise.resolve(mockGameId));
            let gameId = await controller.getOrCreateMainGame();
            expect(gameId).toEqual(mockGameId);
            expect(mockRedis.get).toHaveBeenCalled();
            expect(mockRedis.set).not.toHaveBeenCalled();
            expect(mockRedis.get).toHaveBeenCalledWith('game:main');
        });

        it('should create a new game if not existing', async () => {
            mockRedis.get.mockImplementationOnce((key) => Promise.resolve(null));
            mockRedis.set.mockImplementationOnce((key, value) => Promise.resolve("result"));
            const mockGameId = 'new';
            controller.createGame = jest.fn().mockImplementationOnce(() => Promise.resolve(mockGameId));
            let gameId = await controller.getOrCreateMainGame();
            expect(gameId).not.toBeNull();
            expect(mockRedis.get).toHaveBeenCalled();
            expect(mockRedis.set).toHaveBeenCalled();
        });
    });
    describe("createGame", () => {
        it("Should set a new game value in redis, initializing", async () => {
            mockRedis.set.mockImplementationOnce((key, value) => Promise.resolve("result"));
            let playlist = [
                {id: 1, title: 'test', preview: 'test', artist: 'test'},
                {id: 2, title: 'test', preview: 'test', artist: 'test'},
                {id: 3, title: 'test', preview: 'test', artist: 'test'},
                {id: 4, title: 'test', preview: 'test', artist: 'test'},
            ];
            mockPlaylistService.generatePlaylist.mockImplementationOnce(() => Promise.resolve(playlist));
            await controller.createGame();
            expect(mockRedis.set).toHaveBeenCalled();
            let [key, value] = mockRedis.set.mock.calls[0];
            expect(value).toEqual(JSON.stringify({status: GameStatusValue.INITIALIZING,playlist}));

        })
    })

});