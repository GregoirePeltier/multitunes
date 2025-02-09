import {StemType} from "../model/Track.ts";

export interface StemLoadingState {

    stem: StemType,
    loaded: boolean
    progress: number
}