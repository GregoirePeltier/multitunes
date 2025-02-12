 import { Repository } from 'typeorm';
import { Track } from "../models/Track";
import {Source, TrackSource} from "../models/TrackSource";

interface TrackData {
    title: string;
    artist: string;
    preview: string;
    cover: string;
    source?: Source;
    sourceUrl?: string;
    sourceId?: string; // Added this field
}

export class TrackController {
    constructor(
        private tracksRepository: Repository<Track>,
        private trackSourceRepository: Repository<TrackSource>
    ) {}

    async getAllTracks() {
        const tracks = await this.tracksRepository.find({
            relations: ['trackSource']
        });
        return tracks;
    }

    async createTrack(trackData: TrackData) {
        if (trackData.source && (!trackData.sourceId || !trackData.sourceUrl)) {
            throw new Error('Source ID and URL are required when source is provided');
        }

        const track = await this.saveTrackWithSource(trackData);
        return this.getTrackWithSource(track.id);
    }

    async updateTrack(trackId: number, trackData: TrackData) {
        if (trackData.source && (!trackData.sourceId || !trackData.sourceUrl)) {
            throw new Error('Source ID and URL are required when source is provided');
        }

        const existingTrack = await this.getTrackWithSource(trackId);
        if (!existingTrack) {
            throw new Error('Track not found');
        }

        const updatedTrack = await this.saveTrackWithSource(trackData, trackId);
        return this.getTrackWithSource(updatedTrack.id);
    }

    async deleteTrack(trackId: number) {
        const result = await this.tracksRepository.delete(trackId);
        if (result.affected === 0) {
            throw new Error('Track not found');
        }
        return true;
    }

    private async saveTrackWithSource(data: TrackData, trackId?: number) {
        const { title, artist, preview, cover, source, sourceUrl, sourceId } = data;

        // Create or update track
        const track = this.tracksRepository.create({
            ...(trackId && { id: trackId }),
            title,
            artist,
            preview,
            cover
        });
        await this.tracksRepository.save(track);

        // Handle track source
        if (source && sourceUrl && sourceId) {
            const trackSource = this.trackSourceRepository.create({
                source:source,
                url: sourceUrl,
                sourceId,
                track
            });
            await this.trackSourceRepository.save(trackSource);
        }

        return track;
    }

    private async getTrackWithSource(trackId: number) {
        return this.tracksRepository.findOne({
            where: { id: trackId },
            relations: ['trackSource']
        });
    }
}