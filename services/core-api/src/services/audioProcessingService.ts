import {Redis} from "ioredis";
import {Track} from "../models/track";

export interface ProcessingJob {
    trackId: string;
    status: 'pending' | 'processing' | 'completed';
    instruments?: {
        [key: string]: string;  // instrument -> CDN URL mapping
    };
    previewUrl: string;
}

export class AudioProcessingService {
    private redis: Redis;

    constructor(redisClient: Redis) {
        this.redis = redisClient;
    }

    async submitTrack(track: Track): Promise<string> {
        const jobId = crypto.randomUUID();
        await this.redis.hset(`job:${jobId}`, {
            trackId: track.id,
            status: 'pending',
            previewUrl: track.previewUrl,
        });

        // Notify audio processor
        await this.redis.publish('audio:process', JSON.stringify({jobId, track}));
        return jobId;
    }

    async getJobStatus(jobId: string): Promise<ProcessingJob> {
        const job = await this.redis.hgetall(`job:${jobId}`);
        if (job.trackId==undefined) throw new Error('Job not found');

        return {
            trackId: job.trackId,
            status: job.status as ProcessingJob['status'],
            previewUrl: job.previewUrl,
            instruments: job.instruments ? JSON.parse(job.instruments) : undefined
        };
    }
}