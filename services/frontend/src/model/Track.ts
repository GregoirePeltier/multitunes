export interface Track{
    id:number;
    title:string;
    artist:string;
    album:string;
    cover:string;
    source?:SoureLink;
}
export interface SoureLink{
    source:TrackSource;
    url:string;
}
export enum TrackSource{
    DEEZER = "deezer",
}
export interface TrackAudio{
    trackId:number;
    audioBlobUrl:string;
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