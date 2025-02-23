import {Track} from "./Track.ts";

export interface Question {
   track:Track;
    answers:Array<Track>;
}