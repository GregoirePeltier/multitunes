import {useEffect, useState} from "react";
import {StemAudio} from "./MultiTunePlayer.tsx";
import {StemType} from "../model/Track.ts";

export function ProgressBar(props: { audioTracks: Array<StemAudio> }) {
    const [time, setTime] = useState(0);
    const activeStems = props.audioTracks.filter(({audio})=>audio.volume!=0).map(({stem})=>stem)
    const progress = (time / 30) * 100

    const stems = props.audioTracks.map((track) => track.stem);
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
                {stem}
            </div>)}
        </div>
        <div className={"progress-bar-container"}>
            <div className={"progress-bar"} style={{width: `${progress}%`}}>
            </div>
        </div>
    </>
}