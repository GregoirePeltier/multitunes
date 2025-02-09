import {Stem, StemType, Track} from "../model/Track.ts";

const STEM_BUCKET_ROOT = "https://storage.googleapis.com/multitune-stem-storage/stems"
export const STEMS =[
    StemType.DRUMS,StemType.VOCALS,StemType.BASS,StemType.GUITAR,StemType.PIANO,StemType.OTHER
]
export class TrackService {

    public static  getTrackStemUrls(track:Track): Array<[StemType,string]>{
        return STEMS.map((stem)=> [stem,`${STEM_BUCKET_ROOT}/${track.id}/${stem}.mp3`])
    }

    static async getStemBlob(url: string):Promise<string> {
        const response = await fetch(url,{headers:{}});
        const data = await response.arrayBuffer();
        const blob = new Blob([data], { type: "audio/mp3" });
        const blobUrl = URL.createObjectURL(blob);
        return blobUrl
    }

    static async loadStems(track: Track) :Promise<Stem[]>{
        const urls = this.getTrackStemUrls(track);
        return Promise.all(urls.map(async ([type,url])=>{
            const blob = await this.getStemBlob(url)
            return {
                trackId:track.id,
                stemType:type,
                stemBlobUrl:blob,
            }
        }))
    }
}