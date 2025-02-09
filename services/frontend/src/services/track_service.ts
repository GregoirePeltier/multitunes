import {Stem, StemType, Track} from "../model/Track.ts";
import {StemLoadingState} from "../components/StemLoadingState.tsx";

const STEM_BUCKET_ROOT = "https://storage.googleapis.com/multitune-stem-storage/stems"
export const STEMS = [
    StemType.DRUMS, StemType.VOCALS, StemType.BASS, StemType.GUITAR, StemType.PIANO, StemType.OTHER
]

export class TrackService {

    public static getTrackStemUrls(track: Track): Array<[StemType, string]> {
        return STEMS.map((stem) => [stem, `${STEM_BUCKET_ROOT}/${track.id}/${stem}.mp3`])
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

    static async loadStems(track: Track, onUpdate: (stems: Array<StemLoadingState>) => void): Promise<Stem[]> {
        const urls = this.getTrackStemUrls(track);
        const progresses = new Array(urls.length).fill(0);
        const values = await Promise.all(urls.map(async ([type, url], url_index) => {

            const blob = await this.getStemBlob(url, (progress) => {
                progresses[url_index] = progress
                onUpdate(
                    progresses.map((value, index) => {
                        return {stem: urls[index][0], loaded: false, progress: value}
                    })
                )
            })

            return {
                trackId: track.id,
                stemType: type,
                stemBlobUrl: blob,
            }
        }))
        onUpdate(progresses.map((_,index)=>{
            return {stem: urls[index][0], loaded: true, progress: 100}
        }))
        return values
    }
}