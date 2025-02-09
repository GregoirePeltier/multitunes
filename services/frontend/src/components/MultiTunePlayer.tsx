// @flow

import {Stem, StemType} from "../model/Track.ts";
import {useEffect, useState} from "react";
import {ProgressBar} from "./ProgressBar.tsx";

type Props = {
    stems: Array<Stem>;
    onReachedEnd: () => void;
    isPlaying: boolean;
};
export type StemAudio = {
    stem: StemType,
    audio: HTMLAudioElement,
};
const STEM_TIMES = new Map<StemType, number>(
    [
        [StemType.DRUMS, 10],
        [StemType.GUITAR, 15],
        [StemType.BASS, 5],
        [StemType.VOCALS, 20],
        [StemType.PIANO, 0],
        [StemType.OTHER, 0]
    ]
)

export function MultiTunePlayer(props: Props) {
    const { stems, isPlaying} = props;
    const [stemAudios, setStemAudios] = useState<Array<StemAudio>>([]);

    const reachedEnd = () => {
        stemAudios.forEach((t) => {
            t.audio.pause()
        })
        props.onReachedEnd();
    }
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
            audio.volume = 0;
            audio.loop = false;
            return {
                stem: stem.stemType,
                audio: audio
            }
        })
        stemAudios[0].audio.addEventListener("timeupdate", () => {
            if (stemAudios[0].audio.currentTime >= 10) {
                reachedEnd()
            }
            stemAudios.forEach(({stem, audio}) => {
                const currentTime = audio.currentTime;
                const shouldBeActive = currentTime > (STEM_TIMES.get(stem) || 0);
                if (shouldBeActive && audio.volume != 1) {
                    audio.volume = 1;
                } else if (audio.volume === 1 && !shouldBeActive) {
                    audio.volume = 0
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


    if (!stemAudios) {
        return <div>Loading</div>
    }

    return (
        <div className={"player"}>
            {stemAudios.length != 0 && <ProgressBar audioTracks={stemAudios}/>}
        </div>
    );
}
;