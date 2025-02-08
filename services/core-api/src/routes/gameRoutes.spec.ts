import request from 'supertest';
import express from 'express';
import gameRoutes from './gameRoutes';
import {GameController} from "../controllers/gameController";
import {Game, GameStatusValue} from "../models/Game";

describe('Game Routes', () => {
  let app: express.Application;
  let mockGameController: jest.Mocked<GameController>;

  beforeEach(() => {

    mockGameController = {
      createGame:jest.fn()
    } as any;

    app = express();
    app.use(express.json());
    app.use('/api/game', gameRoutes(mockGameController));
  });

  it('should ask and return the game', async () => {
    const mockGame:Game = {questions:[]}
    mockGameController.createGame.mockImplementation(()=>Promise.resolve(mockGame));
    const response = await request(app).get("/api/game/create").expect(200);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockGame);
  })
});