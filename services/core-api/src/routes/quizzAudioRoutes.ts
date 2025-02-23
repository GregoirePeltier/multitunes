// src/routes/trackQuizAudioRoutes.ts
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {TrackQuizAudioController} from "../controllers/trackQuizAudioController";

export const trackQuizAudioRoutes = (controller: TrackQuizAudioController) => {
    const router = Router();
    
    // Get a single track quiz audio by ID
    router.get('/:id', authenticateToken, async (req, res) => {

        let id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({error: 'Invalid ID format'});
        }
        
        try {
            const result = await controller.getById(id);
            if (!result) {
                res.status(404).json({error: 'Track quiz audio not found'});
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({error: (error as Error).message});
        }
    });
    
    // Create a new track quiz audio
    router.post('/', authenticateToken, async (req, res) => {
        try {
            const result = await controller.create({
                audioUrl: req.body.audioUrl,
                questionId: req.body.questionId,
               trackId: req.body.trackId,
                stemsStarts:req.body.stemsStarts,
                audioTreatmentVersion:req.body.audioTreatmentVersion,
                prepared:req.body.prepared,
            });
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    });

    // Get all track quiz audios
    router.get('/', authenticateToken, async (req, res) => {
        try {
            const result = await controller.getAll();
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    });

    // Update a track quiz audio
    router.put('/:id', authenticateToken, async (req, res) => {
        try {
            const result = await controller.update(req.params.id, {
                audioUrl: req.body.audioUrl,
                questionId: req.body.questionId,
               trackId: req.body.trackId,
                stemsStarts:req.body.stemsStarts,
                audioTreatmentVersion:req.body.audioTreatmentVersion,
                prepared:req.body.prepared,
            });
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    });

// Route to list the tracks that are not prepared
    router.get('/not-prepared', authenticateToken, async (req, res) => {
        try {
            const result = await controller.getNotPreparedTracks();
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({error: (error as Error).message});
        }
    });
    return router;
};