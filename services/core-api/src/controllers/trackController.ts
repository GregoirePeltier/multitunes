import {Repository} from 'typeorm';
import {Track} from "../models/Track";
import {Source, TrackSource} from "../models/TrackSource";
import {GameGenreValues} from "../models/Game";
import DeezerService from "../services/deezerService";

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
    private deezerService: DeezerService;

    constructor(
        private tracksRepository: Repository<Track>,
        private trackSourceRepository: Repository<TrackSource>
    ) {
        this.deezerService = new DeezerService();
    }

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

        const track = await this.createTrackWithSource(trackData);
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

        const updatedTrack = await this.updateTrackWithSource(trackData, trackId);
        return this.getTrackWithSource(updatedTrack.id);
    }

    async deleteTrack(trackId: number) {
        const result = await this.tracksRepository.delete(trackId);
        if (result.affected === 0) {
            throw new Error('Track not found');
        }
        return true;
    }

    private async createTrackWithSource(data: TrackData, trackId?: number) {
        const {title, artist, preview, cover, source, sourceUrl, sourceId} = data;

        // Create or update track
        const track = this.tracksRepository.create({
            ...(trackId && {id: trackId}),
            title,
            artist,
            preview,
            cover,
        });

        await this.tracksRepository.insert(track);

        // Save the track and retrieve it after saving
        await this.tracksRepository.insert(track);
        const savedTrack = await this.tracksRepository.findOneOrFail({where: {id: track.id}});
        if (source && sourceUrl && sourceId) {
            // Create and save the track source
            const trackSource = this.trackSourceRepository.create({
                track: savedTrack,
                source,
                url: sourceUrl,
                sourceId,
            });
            await this.trackSourceRepository.insert(trackSource);
        }


        return track;
    }

    private async updateTrackWithSource(data: TrackData, trackId?: number) {
        const {title, artist, preview, cover, source, sourceUrl, sourceId} = data;

        // Create or update track
        const track = this.tracksRepository.create({
            ...(trackId && {id: trackId}),
            title,
            artist,
            preview,
            cover,
        });

        await this.tracksRepository.update(trackId!, track);
        if (source && sourceUrl && sourceId) {
            await this.trackSourceRepository.update({track: track}, {
                source,
                url: sourceUrl,
                sourceId,
            })
        }

        return track;
    }

    async getTrackWithSource(trackId: number) {
        return this.tracksRepository.findOne({
            where: {id: trackId},
            relations: ['trackSource']
        });
    }

    async ingestNewTracks() {
        let ingested_count = 0
        for (const genre of GameGenreValues) {
            const tracks = await this.deezerService.getChartsByGenre(genre);
            for (const track of tracks.data) {
                const existingTrack = await this.tracksRepository.findOne({
                    where: {
                        trackSource: {
                            source: Source.DEEZER,
                            sourceId: track.id.toString()
                        }
                    },
                    relations: ['trackSource']
                });
                if (existingTrack) {
                    continue;
                }
                const trackData: TrackData = {
                    title: track.title_short,
                    artist: track.artist.name,
                    preview: track.preview,
                    cover: track.album.cover_medium,
                    source: Source.DEEZER, // Assuming 'DEEZER' is one of your Source types
                    sourceUrl: track.link,
                    sourceId: track.id.toString(),
                };
                try {
                    await this.createTrack(trackData);
                    ingested_count++;
                    console.log(`Ingested track: ${track.title_short} - ${track.artist.name}`);
                } catch (error:any) {
                    console.error(`Failed to ingest track: ${track.title_short} - ${error.message}`);
                }
            }
        }
        console.log(`Ingested ${ingested_count} tracks`);
    }
}