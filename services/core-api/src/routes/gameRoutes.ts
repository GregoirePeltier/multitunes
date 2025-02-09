import express from 'express';
import {GameController} from "../controllers/gameController";



export default function gameRoutes(gameController: GameController) {
    const router = express.Router();
    router.post("/create",async (req: express.Request, res: express.Response) => {
        console.log(req.body)
        const genre = req.body.genreId;
        try{
            const game = await gameController.createGame({genreId:genre});
            res.send(game);
        }catch (err:any){
            console.error(err);
            res.status(500).send(err.message+"\n");
        }
    })
    router.get("/create",async (req: express.Request, res: express.Response) => {
        try{
            console.log("created")
            const game = await gameController.createGame();
            res.send(game);
        } catch(err:any){
            res.status(500).send(err.message+"\n"+err.stack);
        }
    })
    return router;
}