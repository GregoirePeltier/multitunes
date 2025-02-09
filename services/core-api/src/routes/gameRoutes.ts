import express from 'express';
import {GameController} from "../controllers/gameController";



export default function gameRoutes(gameController: GameController) {

    const router = express.Router();
    router.get("/create",async (req: express.Request, res: express.Response) => {
        try{
            const game = await gameController.createGame();
            res.send(game);
        } catch(err:any){
            res.status(500).send(err.message+"\n"+err.stack);
        }
    })
    return router;
}