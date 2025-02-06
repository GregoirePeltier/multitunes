import {Track} from "../models/track";
import {Redis} from "ioredis";
import axios from 'axios';

/**
 * Responsible for generating track playlists
 * For now is using deezer radio system as a backend
 * Ask the deezer radio for a list of tracks
 */
export class PlaylistService {
    private redis:Redis
    constructor(redis:Redis) {
        this.redis = redis;
    }
    async getRandomTracklist(): Promise<Track[]> {
        let radios = (await axios.get("https://api.deezer.com/radio")).data;
        let radio = radios[Math.floor(Math.random() * Math.min(radios.length, 10))];
        let tracks = (await axios.get(radio.tracklist)).data;
        return tracks;
    }
    async generatePlaylist(params: {
        trackCount?: number;
    } = {}): Promise<Track[]> {
        let selectedTracks = await this.getRandomTracklist()
        selectedTracks = selectedTracks.filter(t=>t.preview!=undefined).slice(0, params.trackCount || 10);
        // Cache selected tracks
        await Promise.all(selectedTracks.map(track =>
            this.redis.hset(`track:${track.id}`, track)
        ));

        return selectedTracks;
    }

}
