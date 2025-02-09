import {Track} from "../models/track";
import {Redis} from "ioredis";
import axios from 'axios';
import {Storage} from '@google-cloud/storage';
import {Utils} from "../utils";

/**
 * Responsible for generating track playlists
 * For now is using deezer radio system as a backend
 * Ask the deezer radio for a list of tracks
 */
export class PlaylistService {
    private availableIds: Set<number> = new Set();
    private storage: Storage;
    private bucketName: string;

    constructor( bucketName: string = 'multitune-stem-storage') {
        this.storage = new Storage({keyFilename: process.env["GOOGLE_APPLICATION_CREDENTIALS"]});
        this.bucketName = bucketName;
    }

    async getAvailableTrackIds(): Promise<Set<number>> {
        if (this.availableIds.size == 0) {
            try {
                const response = await this.storage.bucket(this.bucketName).getFiles({
                    prefix: 'stems/',
                });
                console.log(response);
                const [files] = response;
                for (const file of files) {
                    // File paths are in format: stems/[trackId]/[instrument].mp3
                    const match = file.name.match(/^stems\/(\d+)\//);
                    if (match && match[1]) {
                        this.availableIds.add(parseInt(match[1]));
                    }
                }


            } catch (error) {
                console.error('Error fetching available track IDs:', error);
                throw new Error('Failed to fetch available track IDs from storage');
            }
        }
        return this.availableIds
    }

    async getRandomTracklist(): Promise<Track[]> {
        let radios = (await axios.get("https://api.deezer.com/radio")).data.data;
        radios = radios.filter((r: any) => r.title.toLowerCase().includes("rock") || r.title.toLowerCase().includes("pop"));
        let radio = radios[Math.floor(Math.random() * Math.min(radios.length, 10))];
        let tracks = (await axios.get(radio.tracklist)).data.data;
        tracks = tracks.map((t: any) => ({
            id: t.id,
            title: t.title,
            preview: t.preview,
            artist: t.artist.name,
            album: t.album.title,
            cover: t.album.cover_big,
        }))
        return tracks;
    }

    async generatePlaylist(params: {
        trackCount?: number;
    } = {}): Promise<Track[]> {
        const availableIds = await this.getAvailableTrackIds()
        let selectedTracks:Array<Track> = []
        let trackCount = params.trackCount|| 5;
        while (selectedTracks.length < trackCount) {

            selectedTracks = await this.getRandomTracklist()
            selectedTracks = Utils.shuffleArray(selectedTracks)
            selectedTracks = selectedTracks.filter(t => availableIds.has(t.id)).slice(0, trackCount);
        }


        return selectedTracks;
    }

    async getTrack(id: number):Promise<Track>{
        let response = await axios.get(`https://api.deezer.com/track/${id}`);
        let t = response.data;
        return {
            id: t.id,
            title: t.title,
            preview: t.preview,
            artist: t.artist.name,
            cover: t.album.cover_big,
        }
    }
}
