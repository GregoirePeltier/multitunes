// @flow
import {MultiTunePlayer} from "./MultiTunePlayer.tsx";
import {Track} from "../model/Track.ts";

export function GameBoard(props: Props) {
    let track:Track = {
        album: "", artist: "", title: "Livin' on a prair", track_id: 538660022

    }
    return (
        <div>
            <MultiTunePlayer track={track}/>
        </div>
    );
};