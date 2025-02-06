import request from 'supertest';
import express from 'express';
import gameRoutes from './gameRoutes';
import {GameController} from "../controllers/gameController";
import {GameStatusValue} from "../models/Game";

describe('Game Routes', () => {
  let app: express.Application;
  let mockGameController: jest.Mocked<GameController>;

  beforeEach(() => {

    mockGameController = {
      getOrCreateMainGame: jest.fn(),
      checkGameStatus: jest.fn(),
    } as any;

    app = express();
    app.use(express.json());
    app.use('/api/game', gameRoutes(mockGameController));
  });
  describe('POST /join/main', () => {

    it('should return gameId when game exists', async () => {
      const mockGameId = '123';
      mockGameController.getOrCreateMainGame.mockImplementationOnce(()=>Promise.resolve(mockGameId));

      const response = await request(app)
        .post('/api/game/join/main')
        .expect(200);

      expect(response.body).toEqual({ gameId: mockGameId });
      expect(mockGameController.getOrCreateMainGame).toHaveBeenCalled();
    });


    it('should handle errors', async () => {
      mockGameController.getOrCreateMainGame.mockImplementationOnce(()=>Promise.reject(new Error('Database error')));

      const response = await request(app)
        .post('/api/game/join/main')
        .expect(500);

      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('POST /:gameId/status', () => {
    const mockGameId = '123';
    const mockStatus = { status:GameStatusValue.ACTIVE , players: 2 };

    it('should return game status', async () => {
      mockGameController.checkGameStatus.mockImplementation((id:any)=>Promise.resolve(mockStatus));

      const response = await request(app)
        .post(`/api/game/${mockGameId}/status`)
        .expect(200);

      expect(response.body).toEqual(mockStatus);
      expect(mockGameController.checkGameStatus).toHaveBeenCalledWith(mockGameId);
    });

    it('should handle errors', async () => {
      mockGameController.checkGameStatus.mockRejectedValueOnce(new Error('Game not found'));

      const response = await request(app)
        .post(`/api/game/${mockGameId}/status`)
        .expect(500);

      expect(response.body).toEqual({ error: 'Game not found' });
    });
  });
});