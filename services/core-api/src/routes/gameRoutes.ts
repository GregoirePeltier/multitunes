import express from 'express';
import {GameController} from "../controllers/gameController";
import {authenticateToken} from "../middleware/auth";
import {GameGenre} from "../models/GameGenre";

export default function gameRoutes(gameController: GameController) {
    const router = express.Router();
    // Get available games
    router.get('/available', async (req, res) => {
        try {
            const games = await gameController.getAvailableGames();
            res.json(games);
        } catch (error) {
            res.status(500).json({error: 'Failed to fetch available games'});
        }
    });

    // Get daily game (with optional genre)
    router.get('/daily/:genre?', async (req, res) => {
        try {
            const genre = req.params.genre ? parseInt(req.params.genre) as GameGenre : undefined;
            const date = new Date();
            date.setHours(0, 0, 0, 0);

            const game = await gameController.getGame(date, genre);

            if (!game) {
                res.status(404).json({error: 'Game not found'});
                return;
            }
            const previousGameId = await gameController.getPreviousGameId(game.id) || undefined;
            res.json({...game, previousGameId});
        } catch (error) {
            res.status(500).json({error: 'Failed to fetch daily game'});
        }
    });

    // Get specific game by ID
    router.get('/:id', async (req, res) => {
        try {
            const gameId = parseInt(req.params.id);
            if (isNaN(gameId)) {
                res.status(400).json({error: 'Invalid game ID'});
                return;
            }

            const game = await gameController.getGameById(gameId);
            if (!game) {
                res.status(404).json({error: 'Game not found'});
                return;
            }
            const previousGameId = await gameController.getPreviousGameId(game.id) || undefined;
            res.json({...game, previousGameId});
        } catch (error) {
            res.status(500).json({error: 'Failed to fetch game'});
        }
    });
    router.post('/generate',authenticateToken,async (req, res) => {

        try {
            const {date:targetDate, genre} = req.body;

            if (!targetDate) {
                res.status(400).json({error: 'Target date is required'});
                return;
            }

            const date = new Date(targetDate);
            if (isNaN(date.getTime())) {
                res.status(400).json({error: 'Invalid target date format'});
                return;
            }
            date.setHours(0, 0, 0, 0);
            if (genre===undefined){
                res.status(400).json({error: 'Game genre is required'});
                return;
            }
            const gameGenre = parseInt(genre) as GameGenre;
            if (gameGenre !== undefined && isNaN(gameGenre)) {
                res.status(400).json({error: 'Invalid game genre'});
                return;
            }

            const generatedGame = await gameController.generateGame(date, gameGenre);
            res.status(201).json(generatedGame);
        } catch (error) {
            console.error('Error generating game:', error);
            res.status(500).json({error: 'Failed to generate game'});
        }
    })

    return router;
}