import { Request, Response, NextFunction } from 'express';
import {SourceValues} from "../models/TrackSource";

export const validateTrackData = (req: Request, res: Response, next: NextFunction) => {
    const { title, artist, preview, cover, source, sourceUrl, sourceId } = req.body;

    if (!title || !artist || !cover) {
        res.status(400).json({
            error: 'Title, artist, preview, and cover are required'
        });
        return
    }
    if(preview && typeof preview !== 'string') {
        res.status(400).json({
            error: 'Preview must be a string'
        });
        return
    }
    if(source && !SourceValues.includes(source)) {
        res.status(400).json({
            error: 'Source must be one of: ' + SourceValues.join(', ')
        });
        return
    }
    // If source is provided, sourceUrl and sourceId are required
    if (source && (!sourceUrl || !sourceId)) {
        res.status(400).json({
            error: 'Source URL and Source ID are required when source is provided'
        });
        return
    }

    next();
};