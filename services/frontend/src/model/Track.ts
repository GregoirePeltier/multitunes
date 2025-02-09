export interface Track{
    id:number;
    title:string;
    artist:string;
    album:string;
    cover:string;
}
export interface Stem{
    trackId:number;
    stemType: StemType;
    stemBlobUrl:string;
}

export enum StemType {
    DRUMS = "drums",
    VOCALS = "vocals",
    GUITAR = "guitar",
    BASS = "bass",
    PIANO = "piano",
    OTHER = "other",
}