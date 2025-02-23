import express from 'express';
import {Repository} from 'typeorm';
import {Track} from "../models/Track";
import {TrackSource} from "../models/TrackSource";
import {authenticateToken} from '../middleware/auth';
import {validateTrackData} from '../validators/trackValidators';
import {TrackController} from '../controllers/trackController';

export default function tracksRoutes(
    tracksRepository: Repository<Track>,
    trackSourceRepository: Repository<TrackSource>
) {
    const router = express.Router();
    const controller = new TrackController(tracksRepository, trackSourceRepository);
    router.post("/trigger_new_ingestion", authenticateToken, async (req, res) => {
        // Process in background
        setImmediate(async () => {
            try {
                await controller.ingestNewTracks()
            } catch (error) {
                console.error("Error triggering ingestion process:", error);
            }
        });
        res.status(202).send();
    })
    // Get all tracks (public endpoint)
    router.get("/", authenticateToken, async (req, res) => {
        try {
            const tracks = await controller.getAllTracks();
            res.json(tracks);
        } catch (error) {
            res.status(500).json({error: 'Failed to fetch tracks'});
        }
    });

    // Create track (protected endpoint)
    router.post("/", authenticateToken, validateTrackData, async (req, res) => {
        try {
            const track = await controller.createTrack(req.body);
            res.status(201).json(track);
        } catch (error) {
            console.error('Error creating track:', error);
            res.status(500).json({error: 'Failed to create track'});
        }
    });
    router.get("/:id", authenticateToken, async (req, res) => {
        let id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({error: 'Invalid track ID'});
            return
        }
        try {
            const track = await controller.getTrackWithSource(id);
            if (track === null) {
                res.status(404).json({error: 'Track not found'});
                return
            }
            res.json(track);
        } catch (error) {
            console.error('Error fetching track:', error);
            res.status(500).json({error: 'Failed to fetch track'});
        }
    })
    // Update track (protected endpoint)
    router.put("/:id", authenticateToken, validateTrackData, async (req, res) => {
        try {
            const trackId = parseInt(req.params.id);
            if (isNaN(trackId)) {
                res.status(400).json({error: 'Invalid track ID'});
                return
            }

            const track = await controller.updateTrack(trackId, req.body);
            res.json(track);
        } catch (error: any) {
            if (error.message === 'Track not found') {
                res.status(404).json({error: error.message});
            } else {
                console.error('Error updating track:', error);
                res.status(500).json({error: 'Failed to update track'});
            }
        }
    });

    // Delete track (protected endpoint)
    router.delete("/:id", authenticateToken, async (req, res) => {
        try {
            const trackId = parseInt(req.params.id);
            if (isNaN(trackId)) {
                res.status(400).json({error: 'Invalid track ID'});
                return
            }

            await controller.deleteTrack(trackId);
            res.status(204).send();
        } catch (error: any) {
            if (error.message === 'Track not found') {
                res.status(404).json({error: error.message});
            } else {
                console.error('Error deleting track:', error);
                res.status(500).json({error: 'Failed to delete track'});
            }
        }
    });

    return router;
}