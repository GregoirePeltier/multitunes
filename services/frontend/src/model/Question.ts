import {Track} from "./Track.ts";

export interface Question {
    id: number;
    track:Track;
    answers:Array<Track>;

}