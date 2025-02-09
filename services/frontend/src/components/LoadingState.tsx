import {StemLoadingState} from "./StemLoadingState.tsx";

export interface LoadingState {
    gameLoaded: boolean;
    stemLoading: Array<Array<StemLoadingState>>
}