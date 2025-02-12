// validators/trackValidators.ts
import {Request, Response, NextFunction} from 'express';
import {Source} from "../models/TrackSource";


export const validateTrackData = (req: Request, res: Response, next: NextFunction) => {
    const {title, artist, preview, cover, source, sourceUrl} = req.body;
    // Required fields
    if (!title || typeof title !== 'string') {
        res.status(400).json({error: 'Valid title is required'});
        return;
    }

    if (!artist || typeof artist !== 'string') {
        res.status(400).json({error: 'Valid artist is required'});
        return;
    }

    // Optional fields
    if (preview && typeof preview !== 'string') {
        res.status(400).json({error: 'Preview must be a valid URL string'});
        return;
    }

    if (cover && typeof cover !== 'string') {
        res.status(400).json({error: 'Cover must be a valid URL string'});
        return;
    }

    // Source validation - if one is provided, both must be valid
    if (source || sourceUrl) {
        if (!Object.values(Source).includes(source)) {
            res.status(400).json({error: 'Invalid source type'});
            return;
        }

        if (!sourceUrl || typeof sourceUrl !== 'string') {
            res.status(400).json({error: 'Source URL is required when source is provided'});
            return;
        }
    }

    next();
};