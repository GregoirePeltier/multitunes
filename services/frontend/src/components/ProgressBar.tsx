import {ReactElement, useEffect, useState} from "react";
import {StemAudio} from "./MultiTunePlayer.tsx";
import {StemType} from "../model/Track.ts";
const STEM_VISUALS = new Map<StemType, ReactElement>(
    [
        [StemType.DRUMS, <div className={"stem-visual"}>🥁</div>],
        [StemType.GUITAR, <div className={"stem-visual"}>🎸</div>],
        [StemType.BASS, <div className={"stem-visual"} style={{filter:"hue-rotate(180deg)"}}>🎸</div>],
        [StemType.VOCALS, <div className={"stem-visual"}>🎤</div>],
        [StemType.PIANO, <div className={"stem-visual"}>🎹</div>],
        [StemType.OTHER, <div className={"stem-visual"}>🎶</div>]
    ]
)
export function ProgressBar(props: { audioTracks: Array<StemAudio>,stemOrder:Array<StemType>}) {
    const [time, setTime] = useState(0);
    const activeStems = props.audioTracks.filter(({audio})=>audio.volume!=0).map(({stem})=>stem)
    const progress = (time / 30) * 100

    const stems = props.stemOrder
    const firstTrack = props.audioTracks[0]?.audio;
    useEffect(() => {
        if(firstTrack)
        {
            const interval =    setInterval(()=>{
                setTime(firstTrack.currentTime)
            },100)
            return ()=>clearInterval(interval);
        }

    }, [props.audioTracks,firstTrack]);
    return <>
        <div className={"stem-list"}>
            {stems.map((stem) => <div key={stem} style={{opacity: activeStems.includes(stem) ? 1 : 0.5}}>
                {STEM_VISUALS.get(stem)}
            </div>)}
        </div>
        <div className={"progress-bar-container"}>
            <div className={"progress-bar"} style={{width: `${progress}%`}}>
            </div>
        </div>
    </>
}