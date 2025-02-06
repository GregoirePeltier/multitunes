import {Redis} from "ioredis";
import {GameStatusValue} from "../models/Game";
import {AudioProcessingService, ProcessingJob} from "./audioProcessingService";
import {Track} from "../models/track";

describe('Audio Processing Service', () => {
    let service: AudioProcessingService
    let mockRedis: jest.Mocked<Redis>;

    beforeEach(() => {

        mockRedis = {
            get: jest.fn(),
            set: jest.fn(),
            hset: jest.fn(),
            publish: jest.fn(),
            hgetall: jest.fn(),
        } as any;

        service = new AudioProcessingService(mockRedis);
    });
    describe('submit track', () => {

        it('should add a job when submitting', async () => {
            mockRedis.publish.mockImplementation((key, value) => Promise.resolve(1));
            mockRedis.hset.mockImplementation((key, ...feildValues) => Promise.resolve(0));
            let track: Track = {
                id: "track_test", name: "track_test", previewUrl: "http://test.com",
                artist: "test"
            }
            await service.submitTrack(track);
            expect(mockRedis.hset).toHaveBeenCalled();
            let [key, value] = mockRedis.hset.mock.calls[0] as [string, object];
            let jobId = key.slice(key.indexOf(":") + 1);
            expect(value).toEqual(
                {
                    trackId: track.id,
                    status: 'pending',
                    previewUrl: track.previewUrl
                }
            );
            let [audio_key, audio_value] = mockRedis.publish.mock.calls[0] as [string, string];
            expect(JSON.parse(audio_value)).toEqual({jobId, track});

        });

    });
    describe('getJobStatus', () => {
        it("Should return job status", async () => {
            let mockJob = {
                trackId: "track_test",
                status: "pending",
                previewUrl: "http://test.com",
            };
            mockRedis.hgetall.mockImplementation((key) =>
                Promise.resolve(mockJob));
            let jobId = "test";
            let job = await service.getJobStatus(jobId);
            expect(job).toEqual(mockJob)
        })
        it("Should return error if not known", async () => {
            mockRedis.hgetall.mockImplementation((key) =>Promise.resolve({}));
            let jobId = "test";
            await expect(service.getJobStatus(jobId)).rejects.toThrow();
        })
    })
});