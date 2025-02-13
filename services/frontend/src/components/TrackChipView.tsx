import {Track} from "../model/Track.ts";
import {Link2} from "lucide-react";

export function TrackChipView(props: { track: Track, positive: boolean, points:number}) {
    const {track,positive,points} = props
    return <div className={"track-chip "+(positive?"positive ":"negative ")}>
        <img className={"track-cover"} src={track.cover} alt=""/>
        <a href={track.source && track.source.url} className={"track-info"}>
            <div className={"track-title"}>{track.title}</div>
            <div className={"track-artist"}>{track.artist}</div>
            {track.source&& <Link2/>}
        </a>
        <div className={"track-points positive"}>
            {points != 0 && <>{points} PTS</>}
        </div>
    </div>
}