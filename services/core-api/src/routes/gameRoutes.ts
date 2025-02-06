import express from 'express';
import {GameController} from "../controllers/gameController";



export default function gameRoutes(gameController: GameController) {
    const router = express.Router();
    router.post('/join/main', async (req, res) => {
        try {
            const gameId = await gameController.getOrCreateMainGame();
            res.json({gameId});
        } catch (e:any) {
            res.status(500).json({error: e.message});
        }
    })
    router.post('/:gameId/status', async (req, res) => {
        try {
            const status = await gameController.checkGameStatus(req.params.gameId);
            res.json(status);
        } catch (error:any) {
            res.status(500).json({error: error.message});
        }
    })
    return router;
}