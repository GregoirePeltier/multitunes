// @flow

import {StemType, TrackAudio} from "../model/Track.ts";
import {useCallback, useEffect, useState} from "react";
import {AudioProgressBar} from "./AudioProgressBar.tsx";

type Props = {
    trackAudioData: TrackAudio;
    onReachedEnd: () => void;
    isPlaying: boolean;
    onStemActive: (stems: Array<StemType>) => void;
    points?: number;
};
export type StemAudio = {
    stem: StemType,
    audio: HTMLAudioElement,
};
const TIME_LIMIT = 30;
const STEM_TIMES = new Map<StemType, number>(
    [
        [StemType.PIANO, 0],
        [StemType.OTHER, 0],
        [StemType.BASS, 5],
        [StemType.DRUMS, 10],
        [StemType.GUITAR, 15],
        [StemType.VOCALS, 20]
    ]
)
const POINT_SEGMENTS = [
    {duration: 5, points: 8},
    {duration: 5, points: 7},
    {duration: 5, points: 6},
    {duration: 5, points: 5},
    {duration: 10, points: 4},
]

export function MultiTunePlayer(props: Props) {
    const {trackAudioData, isPlaying, onReachedEnd, points, onStemActive} = props;
    const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement|null>(null);
    const [activeStems, setActiveStems] = useState<Array<StemType>>([]);
    const [time, setTime] = useState(0);
    const reachedEnd = useCallback(() => {
        audioPlayer?.pause()
        onReachedEnd()
    }, [audioPlayer, onReachedEnd])
    useEffect(() => {
        if (!audioPlayer) {
            return;
        }
        if (audioPlayer.paused && isPlaying) {
            audioPlayer.play();
            setActiveStems([StemType.PIANO, StemType.OTHER ])
        } else if (!audioPlayer.paused && !isPlaying) {
            audioPlayer.pause()
        }

    }, [audioPlayer, isPlaying]);
    useEffect(() => {
        if (!trackAudioData) return;
        setAudioPlayer(null);
        const newPlayer = new Audio();
        newPlayer.src = trackAudioData.audioBlobUrl;
        newPlayer.muted = false;
        newPlayer.loop = false;
        setAudioPlayer(newPlayer)
        return () => {
            newPlayer.pause();
            newPlayer.remove();

        }
    }, [trackAudioData]);
    useEffect(() => {
        onStemActive(activeStems)
    }, [onStemActive,activeStems]);
    useEffect(() => {
        if(!audioPlayer) return;
        const playerProgressTimer = () => {
            if (audioPlayer.currentTime >= TIME_LIMIT) {
                reachedEnd()
            }
            const currentTime = audioPlayer.currentTime;
            STEM_TIMES.forEach((time, stem) => {
                if (currentTime > time && !activeStems.includes(stem)) {
                    const newStems = [...activeStems, stem];
                    setActiveStems(newStems)
                }
            })
        };
        audioPlayer.addEventListener("timeupdate", playerProgressTimer);
        const interval = setInterval(() => {
            setTime(audioPlayer.currentTime)
        },100)
        return ()=>{
            audioPlayer.removeEventListener("timeupdate", playerProgressTimer)
            clearInterval(interval)
        }
    }, [audioPlayer,reachedEnd, onStemActive]);

    if (!trackAudioData) {
        return <div>Loading Audio</div>
    }

    const stemOrder = Array.from(STEM_TIMES.entries()).sort(([,a], [,b]) => (a) - (b )).map(([stem,])=>stem);
    return (
        <div className={"player"}>
             <AudioProgressBar points={points}  stemOrder={stemOrder} activeStems={activeStems} time={time}
                                                         pointSegments={POINT_SEGMENTS}/>
        </div>
    );
}
;