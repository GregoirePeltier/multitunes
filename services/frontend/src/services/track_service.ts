import {Track} from "../model/Track.ts";
const STEM_BUCKET_ROOT = "https://storage.googleapis.com/multitune-stem-storage/stems"
export enum StemType{
    DRUMS="drums",
    VOCALS="vocals",
    GUITAR="guitar",
    BASS="bass",
    PIANO="piano",
    OTHER="other",
}
export const STEMS =[
    StemType.DRUMS,StemType.VOCALS,StemType.BASS,StemType.GUITAR,StemType.PIANO,StemType.OTHER
]
export class TrackService {

    public static  getTrackStemUrls(track:Track): Array<[StemType,string]>{
        return STEMS.map((stem)=> [stem,`${STEM_BUCKET_ROOT}/${track.track_id}/${stem}.mp3`])
    }

    static async getStemBlob(url: string):Promise<string> {
        const response = await fetch(url,{headers:{}});
        const data = await response.arrayBuffer();
        const blob = new Blob([data], { type: "audio/mp3" });
        const blobUrl = URL.createObjectURL(blob);
        return blobUrl
    }
}