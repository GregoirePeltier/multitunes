import {ReactElement} from "react";
import {StemType} from "../model/Track.ts";

interface PointSegment {
    duration: number;
    points: number;
}

const STEM_VISUALS = new Map<StemType, ReactElement>(
    [
        [StemType.DRUMS, <div className={"stem-visual"}>🥁</div>],
        [StemType.GUITAR, <div className={"stem-visual"}>🎸</div>],
        [StemType.BASS, <div className={"stem-visual"} style={{filter: "hue-rotate(180deg)"}}>🎸</div>],
        [StemType.VOCALS, <div className={"stem-visual"}>🎤</div>],
        [StemType.PIANO, <div className={"stem-visual"}>🎹</div>],
        [StemType.OTHER, <div className={"stem-visual"}>🎶</div>]
    ]
)

export function AudioProgressBar(props: {
    stemOrder: Array<StemType>,
    pointSegments?: PointSegment[],
    activeStems: Array<StemType>,
    points?: number,
    time:number
}) {
    const {activeStems,points,time} = props;
    const progress = (time / 30) * 100
    const stems = props.stemOrder
    const segments = props.pointSegments?.map((segment, i) => {
        return {
            endTime:props.pointSegments?.slice(0,i+1).reduce((a,b)=>a+b.duration,0)||0,
            ...segment
        }
    });
    return <>
        <div className={"stem-list"}>
            {stems.map((stem) => <div key={stem} style={{opacity: activeStems.includes(stem) ? 1 : 0.5}}>
                {STEM_VISUALS.get(stem)}
            </div>)}
        </div>
        <div className={"progress-bar-container "+(points?"positive":"")}>
            <div className={"progress-bar"} style={{width: `${progress}%`}}>
            </div>
            <div className={"point-marker-container"}>
                {points!==undefined && points!==0 && <div className={"point-marker"}>
                    <div className={"points-bubble"}>{points}</div>
                </div>}
                { !points && segments?.map((segment, index) => (
                    <div
                        key={index}
                        className={"point-marker " + (segment.endTime > time ? "" : "missed")}
                        style={{width: `${segment.duration / 30 * 100}%`}}
                    >
                        {<div className="points-bubble">
                            {segment.points}
                        </div>}
                    </div>
                ))}

            </div>
        </div>
    </>
}