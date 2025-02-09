import {describe, it, beforeEach, jest, expect} from '@jest/globals';
import axios from 'axios';
import Redis from 'ioredis';
import {PlaylistService} from "./playlistService";

// Mock external dependencies
jest.mock('axios');
jest.mock('ioredis');


describe('Playlist Service', () => {
    let playlistService: PlaylistService;
    let mockRedis: jest.Mocked<Redis>;

    const mockTrack = {
        id:1,
        title: 'Test Track',
        preview: 'http://example.com/preview',
        artist: {name:'artist123'},
        album: {title:'album123'}
    };

    beforeEach(() => {
        mockRedis = new Redis() as jest.Mocked<Redis>;
        playlistService = new PlaylistService();
    });


    describe('generatePlaylist', () => {
        beforeEach(() => {
            // Mock searchTracks response
            (axios.get as jest.Mock).mockImplementation((url: string | unknown) => {
                if ((url as any).includes("/tracks")) {
                    return Promise.resolve({
                        data: {data: Array(100).fill(mockTrack)}
                    });
                }
                if ((url as any).includes('/radio')) {
                    return Promise.resolve({
                        data: {
                            data: [{
                                title:"rock",
                                tracklist: "https://api.test_deezer.com/radio/test/tracks"
                            }
                            ]
                        }
                    })
                }
                return Promise.reject(new Error('Not found'));
            });
        });

        it('should generate playlist with number of tracks', async () => {
            const ids = new Set([1,2,3,4,5,6]);
            playlistService.getAvailableTrackIds = jest.fn() as any
            (playlistService.getAvailableTrackIds as jest.Mock).mockImplementation(()=>Promise.resolve(ids));

            const playlist = await playlistService.generatePlaylist({});

            expect(playlist).toHaveLength(5);
            expect(playlist[0]).toEqual({...mockTrack, album: "album123", artist: "artist123"});
        });

    });


});