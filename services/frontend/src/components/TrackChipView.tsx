import {Track} from "../model/Track.ts";

export function TrackChipView(props: { track: Track, positive: boolean, points:number}) {
    const {track,positive,points} = props
    return <div className={"track-chip "+(positive?"positive ":"negative ")}>
        <img className={"track-cover"} src={track.cover} alt=""/>
        <div className={"track-info"}>
            <div className={"track-title"}>{track.title}</div>
            <div className={"track-artist"}>{track.artist}</div>
        </div>
        <div className={"track-points positive"}>
            {points != 0 && <>{points} PTS</>}
        </div>
    </div>
}