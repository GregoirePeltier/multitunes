import {StemType, Track, TrackAudio} from "../model/Track.ts";
const GCP_STORAGE_ROOT:string = import.meta.env.VITE_GCP_STORAGE_ROOT || ""
const STEM_BUCKET_ROOT = `${GCP_STORAGE_ROOT}/audios`
export const STEMS = [
    StemType.DRUMS, StemType.VOCALS, StemType.BASS, StemType.GUITAR, StemType.PIANO, StemType.OTHER
]


export class TrackService {

    public static getTrackStemUrls(track: Track): Array<[StemType, string]> {
        return STEMS.map((stem) => [stem, `${STEM_BUCKET_ROOT}/${track.id}/${stem}.mp3`])
    }

    private static getTrackAudioUrls(track: Track):string {
        return `${STEM_BUCKET_ROOT}/${track.id}/merged.mp3`
    }

    static async getStemBlob(url: string, progress: (p: number) => void): Promise<string> {
        const response = await fetch(url, {headers: {}});
        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 1000*1000;
        let loaded = 0;

        // Create a stream from the response
        const reader = response.body!.getReader();
        const chunks: Uint8Array[] = [];

        while (true) {
            const {done, value} = await reader.read();

            if (done) break;

            chunks.push(value);
            loaded += value.length;

            if (total) {
                // Calculate and report progress percentage
                const percent = (loaded / total) * 100;
                progress(percent);
            }
        }

        // Concatenate chunks into a single Uint8Array
        const allChunks = new Uint8Array(loaded);
        let position = 0;
        for (const chunk of chunks) {
            allChunks.set(chunk, position);
            position += chunk.length;
        }

        const blob = new Blob([allChunks], {type: "audio/mp3"});
        return URL.createObjectURL(blob);
    }


    static async loadAudio(track: Track, onProgress: (loading:number) => void):Promise<TrackAudio> {
        const url = this.getTrackAudioUrls(track);
        const blob= await this.getStemBlob(url, onProgress)
        onProgress(100)
        return {trackId:track.id,audioBlobUrl:blob}
    }
}