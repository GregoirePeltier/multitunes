
import {GameController} from "../controllers/gameController";
import {Redis} from "ioredis";

describe('Game Controller', () => {
  let controller:GameController
  let mockRedis: jest.Mocked<Redis>;

  beforeEach(() => {

    mockRedis = {
      get:jest.fn(),
        set:jest.fn(),
    } as any;

    controller = new GameController(mockRedis);
  });
  describe('getOrCreateMainGame', () => {

    it('should return the main game if existing', async () => {
      const mockGameId = '123';
      mockRedis.get.mockImplementationOnce((key)=>Promise.resolve(mockGameId));
      let gameId = await controller.getOrCreateMainGame();
      expect(gameId).toEqual(mockGameId);
      expect(mockRedis.get).toHaveBeenCalled();
      expect(mockRedis.set).not.toHaveBeenCalled();
      expect(mockRedis.get).toHaveBeenCalledWith('game:main');
    });

    it('should create a new game if not existing', async () => {
        mockRedis.get.mockImplementationOnce((key)=>Promise.resolve(null));
        mockRedis.set.mockImplementationOnce((key, value)=>Promise.resolve("result"));
        const mockGameId = 'new';
        controller.createGame = jest.fn().mockImplementationOnce(()=>Promise.resolve(mockGameId));
        let gameId = await controller.getOrCreateMainGame();
        expect(gameId).not.toBeNull();
        expect(mockRedis.get).toHaveBeenCalled();
        expect(mockRedis.set).toHaveBeenCalled();
    })
  });

});