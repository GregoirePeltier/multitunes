import { Repository } from 'typeorm';
import { Track } from '../../models/Track';
import {Source, TrackSource} from '../../models/TrackSource';
import { TrackController } from '../trackController';

// Mock data
const mockTrackData = {
    title: 'Test Track',
    artist: 'Test Artist',
    preview: 'http://preview.url',
    cover: 'http://cover.url',
    source: 'deezer' as Source,
    sourceUrl: 'http://spotify.url',
    sourceId: 'spotify_123'
};

const mockTrack = {
    id: 1,
    ...mockTrackData
};

const mockTrackSource = {
    id: 1,
    source: mockTrackData.source,
    url: mockTrackData.sourceUrl,
    sourceId: mockTrackData.sourceId,
    track: mockTrack
};

// Mock repositories
const createMockRepositories = () => {
    const tracksRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        delete: jest.fn()
    } as unknown as Repository<Track>;

    const trackSourceRepository = {
        create: jest.fn(),
        save: jest.fn()
    } as unknown as Repository<TrackSource>;

    return { tracksRepository, trackSourceRepository };
};

describe('TrackController', () => {
    let controller: TrackController;
    let tracksRepository: Repository<Track>;
    let trackSourceRepository: Repository<TrackSource>;

    beforeEach(() => {
        const repos = createMockRepositories();
        tracksRepository = repos.tracksRepository;
        trackSourceRepository = repos.trackSourceRepository;
        controller = new TrackController(tracksRepository, trackSourceRepository);
    });

    describe('getAllTracks', () => {
        it('should return all tracks with their sources', async () => {
            const mockTracks = [mockTrack];
            (tracksRepository.find as jest.Mock).mockResolvedValue(mockTracks);

            const result = await controller.getAllTracks();

            expect(result).toEqual(mockTracks);
            expect(tracksRepository.find).toHaveBeenCalledWith({
                relations: ['trackSource']
            });
        });

        it('should handle empty results', async () => {
            (tracksRepository.find as jest.Mock).mockResolvedValue([]);

            const result = await controller.getAllTracks();

            expect(result).toEqual([]);
        });

        it('should propagate errors', async () => {
            const error = new Error('Database error');
            (tracksRepository.find as jest.Mock).mockRejectedValue(error);

            await expect(controller.getAllTracks()).rejects.toThrow(error);
        });
    });

    describe('createTrack', () => {
        it('should create a track with source', async () => {
            (tracksRepository.create as jest.Mock).mockReturnValue(mockTrack);
            (tracksRepository.save as jest.Mock).mockResolvedValue(mockTrack);
            (trackSourceRepository.create as jest.Mock).mockReturnValue(mockTrackSource);
            (trackSourceRepository.save as jest.Mock).mockResolvedValue(mockTrackSource);
            (tracksRepository.findOne as jest.Mock).mockResolvedValue({
                ...mockTrack,
                trackSource: mockTrackSource
            });

            const result = await controller.createTrack(mockTrackData);
            expect(result).not.toBeNull();
            expect(result).toHaveProperty('trackSource');
            expect(tracksRepository.create).toHaveBeenCalled();
            expect(trackSourceRepository.create).toHaveBeenCalled();
            expect(result!.trackSource.sourceId).toBe(mockTrackData.sourceId);
        });

        it('should create a track without source', async () => {
            const trackDataWithoutSource = {
                title: mockTrackData.title,
                artist: mockTrackData.artist,
                preview: mockTrackData.preview,
                cover: mockTrackData.cover
            };

            (tracksRepository.create as jest.Mock).mockReturnValue(mockTrack);
            (tracksRepository.save as jest.Mock).mockResolvedValue(mockTrack);
            (tracksRepository.findOne as jest.Mock).mockResolvedValue(mockTrack);

            const result = await controller.createTrack(trackDataWithoutSource);

            expect(result).not.toHaveProperty('trackSource');
            expect(trackSourceRepository.create).not.toHaveBeenCalled();
        });

        it('should throw error when source is provided without sourceId', async () => {
            const invalidData = {
                ...mockTrackData,
                sourceId: undefined
            };

            await expect(controller.createTrack(invalidData))
                .rejects
                .toThrow('Source ID and URL are required when source is provided');
        });
    });

    describe('updateTrack', () => {
        it('should update an existing track with source', async () => {
            (tracksRepository.findOne as jest.Mock).mockResolvedValue(mockTrack);
            (tracksRepository.create as jest.Mock).mockReturnValue(mockTrack);
            (tracksRepository.save as jest.Mock).mockResolvedValue(mockTrack);
            (trackSourceRepository.create as jest.Mock).mockReturnValue(mockTrackSource);
            (trackSourceRepository.save as jest.Mock).mockResolvedValue(mockTrackSource);

            const result = await controller.updateTrack(1, mockTrackData);

            expect(result).toBeDefined();
            expect(tracksRepository.save).toHaveBeenCalled();
            expect(trackSourceRepository.save).toHaveBeenCalled();
        });

        it('should throw error when track not found', async () => {
            (tracksRepository.findOne as jest.Mock).mockResolvedValue(null);

            await expect(controller.updateTrack(999, mockTrackData))
                .rejects
                .toThrow('Track not found');
        });

        it('should update track without source information', async () => {
            const trackDataWithoutSource = {
                title: 'Updated Title',
                artist: 'Updated Artist',
                preview: mockTrackData.preview,
                cover: mockTrackData.cover
            };

            (tracksRepository.findOne as jest.Mock).mockResolvedValue(mockTrack);
            (tracksRepository.create as jest.Mock).mockReturnValue(mockTrack);
            (tracksRepository.save as jest.Mock).mockResolvedValue(mockTrack);

            const result = await controller.updateTrack(1, trackDataWithoutSource);

            expect(result).toBeDefined();
            expect(trackSourceRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('deleteTrack', () => {
        it('should delete an existing track', async () => {
            (tracksRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

            const result = await controller.deleteTrack(1);

            expect(result).toBe(true);
            expect(tracksRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw error when track not found', async () => {
            (tracksRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });

            await expect(controller.deleteTrack(999))
                .rejects
                .toThrow('Track not found');
        });

        it('should propagate database errors', async () => {
            const error = new Error('Database error');
            (tracksRepository.delete as jest.Mock).mockRejectedValue(error);

            await expect(controller.deleteTrack(1)).rejects.toThrow(error);
        });
    });
});