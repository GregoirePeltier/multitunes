import axios from 'axios';
import {Storage} from '@google-cloud/storage';
import {Utils} from "../utils";
import {Track} from "../models/Game";

/**
 * Responsible for generating track playlists
 * For now is using deezer radio system as a backend
 * Ask the deezer radio for a list of tracks
 */
export class PlaylistService {
    private availableIds: Set<number> = new Set();
    private storage: Storage;
    private bucketName: string;

    constructor(bucketName: string = 'multitune-stem-storage') {
        this.storage = new Storage({keyFilename: process.env["GOOGLE_APPLICATION_CREDENTIALS"]});
        this.bucketName = bucketName;
    }

    async getAvailableTrackIds(): Promise<Set<number>> {
        if (this.availableIds.size == 0) {
            try {
                const response = await this.storage.bucket(this.bucketName).getFiles({
                    prefix: 'stems/',
                });
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

    async getRandomTracklist(styleId?: number): Promise<Track[]> {
        let radio;
        if (styleId) {
            let rados = (await axios.get(`https://api.deezer.com/genre/${styleId}/radios`)).data.data;
            radio = rados[Math.floor(Math.random() * Math.min(rados.length, 10))];
        } else {
            let radios = (await axios.get("https://api.deezer.com/radio")).data.data;
            radios = radios.filter((r: any) => r.title.toLowerCase().includes("rock") || r.title.toLowerCase().includes("pop"));
            radio = radios[Math.floor(Math.random() * Math.min(radios.length, 10))];
        }

        let tracks = undefined;
        while (!tracks) {
            tracks = (await axios.get(radio.tracklist)).data.data;
        }
        tracks = tracks.filter((t: any) => t.title)
        tracks = tracks.filter((t: any) => t.artist != undefined)
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
        styleId?: number;
    } = {}): Promise<Track[]> {
        const availableIds = await this.getAvailableTrackIds()
        let selectedTracks: Array<Track> = []

        selectedTracks = await this.getRandomTracklist(params.styleId)
        selectedTracks = Utils.shuffleArray(selectedTracks)
        selectedTracks = selectedTracks.filter(t => availableIds.has(t.id));


        return selectedTracks;
    }

    async getTrack(id: number): Promise<Track> {
        let response = await axios.get(`https://api.deezer.com/track/${id}`);
        let t = response.data;
        return {
            id: t.id,
            title: t.title,
            preview: t.preview,
            artist: t.artist?.name,
            cover: t.album?.cover_big,
            questions:[]
        }
    }
}
