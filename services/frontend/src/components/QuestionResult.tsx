import {Track} from "../model/Track.ts";

export function QuestionResult(props: { track: Track, answer: number, onNext: () => void, done: boolean }) {
    const {track, answer, onNext, done} = props
    return <div className={"question-result"}>
        <div className={"track-card card"}>
            <img className={"track-cover"} src={track.cover} alt=""/>
            <div className={"track-title"}>{track.title}</div>
            <div className={"track-artist"}>{track.artist}</div>

        </div>
        <div>You
            guessed {answer === track.id ? "right" : "wrong"}</div>
        <button className={"button"} onClick={onNext}>{done ? "Results" : "Next"}</button>
    </div>;
}