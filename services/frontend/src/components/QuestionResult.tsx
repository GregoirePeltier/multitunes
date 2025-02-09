import {Track} from "../model/Track.ts";

export function QuestionResult(props: { track: Track, points:number, onNext: () => void, done: boolean }) {
    const {track, points, onNext, done} = props
    return <div className={"question-result"}>
        <div className={"track-card card"}>
            <img className={"track-cover"} src={track.cover} alt=""/>
            <div className={"track-title"}>{track.title}</div>
            <div className={"track-artist"}>{track.artist}</div>

        </div>
        <div className={"primary-bg chip"} >{points === 0 && <div className={"negative"}>You won no points</div>}
            {points != 0 && <div className={"positive"}>You won {points} points</div>}</div>
        <button className={"button"} onClick={onNext}>{done ? "Results" : "Next"}</button>
    </div>;
}