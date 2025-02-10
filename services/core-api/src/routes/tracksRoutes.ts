import express from 'express';
import {GameGenre, Track} from "../models/Game";
import { Repository } from 'typeorm';

export default function tracksRoutes(tracksRepository:Repository<Track>) {
    const router = express.Router();
    router.get("/",async (req,res)=>{
        const tracks = await tracksRepository.createQueryBuilder("track")
        .select(["track.id"])
        .getMany();
        res.json(tracks);
    })
    return router;
}