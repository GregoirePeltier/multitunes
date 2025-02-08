import { Track } from "./track";

export interface Game{

}
export enum GameStatusValue{
    ACTIVE="active",
    ENDED="ended",
    INITIALIZING="initializing",
}
export interface GameStatus{
    status:GameStatusValue,
    players:number
}
export interface Answer{
    id:number;
    title:string;
}
export interface Question{
    track:Track,
    answers : Array<Answer>,
}
export interface Game{
    questions:Array<Question>,
}