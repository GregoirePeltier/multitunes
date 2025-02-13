// @flow

import {Stem, StemType} from "../model/Track.ts";
import {ReactElement, useCallback, useEffect, useState} from "react";
import {AudioProgressBar} from "./AudioProgressBar.tsx";

type Props = {
    stems: Array<Stem>;
    onReachedEnd: () => void;
    isPlaying: boolean;
    onStemActive:(stems: Array<StemType>) => void;
    points?: number;
};
export type StemAudio = {
    stem: StemType,
    audio: HTMLAudioElement,
};
const TIME_LIMIT=30;
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
    {duration:5,points:8},
    {duration:5,points:7},
    {duration:5,points:6},
    {duration:5,points:5},
    {duration:10,points:4},
]

export function MultiTunePlayer(props: Props) {
    const { stems, isPlaying,onReachedEnd,points} = props;
    const [stemAudios, setStemAudios] = useState<Array<StemAudio>>([]);

    const reachedEnd = useCallback(() => {
        stemAudios.forEach((t) => {
            t.audio.pause()
        })
        onReachedEnd()
    },[stemAudios,onReachedEnd])
    useEffect(() => {
        stemAudios.forEach(({audio}) => {
            if (audio.paused && isPlaying) {
                audio.play();
            } else if (!audio.paused && !isPlaying) {
                audio.pause()
            }
        })
    }, [stemAudios, isPlaying]);
    useEffect(() => {
        if (!stems ){return}
        setStemAudios([]);
        const stemAudios = stems.map((stem) => {
            const audio = new Audio();
            audio.src = stem.stemBlobUrl
            audio.muted = true;
            audio.loop = false;
            return {
                stem: stem.stemType,
                audio: audio
            }
        })
        stemAudios[0].audio.addEventListener("timeupdate", () => {
            stemAudios.forEach(({stem, audio}) => {
                const currentTime = audio.currentTime;
                const shouldBeActive = currentTime > (STEM_TIMES.get(stem) || 0);
                if (shouldBeActive && audio.muted) {
                    audio.muted = false;
                    props.onStemActive(stemAudios.filter(({audio })=>!audio.muted).map(({stem})=>stem))
                } else if (!audio.muted && !shouldBeActive) {
                    audio.muted = true;
                }
            })

        })

        setStemAudios(stemAudios);
        return () => {
            stemAudios.forEach((t) => {
                t.audio.pause();
                t.audio.remove()
            })
        }
    }, [stems]);
    useEffect(() => {
        if (!stemAudios || stemAudios.length == 0) {
            return
        }

        const endReachedListener = ()=>{
            if (stemAudios[0].audio.currentTime >= TIME_LIMIT) {
                reachedEnd()
            }
        };
        stemAudios[0].audio.addEventListener("timeupdate",endReachedListener)
        return ()=>{
            stemAudios[0].audio.removeEventListener("timeupdate",endReachedListener)
        }
    }, [stemAudios,reachedEnd]);

    if (!stemAudios) {
        return <div>Loading Stems</div>
    }

    const stemOrder = stemAudios.map(({stem})=>stem).sort((a, b)=>(STEM_TIMES.get(a)||0)-(STEM_TIMES.get(b)||0));
    return (
        <div className={"player"}>
            {stemAudios.length != 0 && <AudioProgressBar points={points} audioTracks={stemAudios} stemOrder={stemOrder} pointSegments={POINT_SEGMENTS}/>}
        </div>
    );
}
;