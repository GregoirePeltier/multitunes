// @flow

import {Track} from "../model/Track.ts";
import {STEMS, StemType, TrackService} from "../services/track_service.ts";
import {useEffect, useState} from "react";

type Props = {
    track: Track;
};
type StemAudio = {
    stem: StemType,
    audio: HTMLAudioElement,
};
type StemLoading = Array<[StemType, boolean]>
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

function ProgressBar(props: { audioTracks: Array<StemAudio> }) {
    const [time, setTime] = useState(0);
    const [activeStems,setActiveStems] = useState<StemType[]>([]);
    const progress = (time / 30)*100
    const stems = props.audioTracks.map((track) => track.stem);
    useEffect(() => {
        props.audioTracks.forEach((t) => {
            const audio = t.audio
            audio.addEventListener("volumechange", () =>
            {
                if (audio.volume!=0){
                    setActiveStems((stems)=>[...stems.filter(s=>s!=t.stem),t.stem])
                }
            })
        })
        props.audioTracks[0].audio.addEventListener("timeupdate", () => {
            setTime(props.audioTracks[0].audio.currentTime)
        })
    }, [props.audioTracks]);
    return <div>
        <div className={"stem-list"}>
            {stems.map((stem) => <div key={stem} style={{opacity:activeStems.includes(stem)?1:0.5}}>
                {stem}
            </div>)}
        </div>
        <div className={"progress-bar-container"}>
            <div className={"progress-bar"} style={{width: `${progress}%`}}>
            </div>
        </div>
    </div>
}

export function MultiTunePlayer(props: Props) {

    const [audioTracks, setAudioTracks] = useState<Array<StemAudio>>([]);
    const [tracksLoaded, setTracksLoaded] = useState<StemLoading>(STEMS.map((stem) => [stem, false]));
    const [isPlaying,setIsPlaying] = useState(false);
    const {track} = props;
    useEffect(() => {

        const stems = TrackService.getTrackStemUrls(track)
        setAudioTracks([])
        Promise.all(stems.map(async ([stem, url]) => await TrackService.getStemBlob(url).then((blob) => {
            const audio = new Audio();
            audio.src = blob
            audio.volume = 0
            setTracksLoaded((loaded) => loaded.map(([loadedStem, state]) => [loadedStem, loadedStem == stem ? true : state]))
            const stemAudios = {stem: stem, audio: audio};
            setAudioTracks((tracks) => [...tracks.filter((s) => s.stem != stem), stemAudios])
            return stemAudios
        })))
            .then((stemAudios) => {
                stemAudios.forEach(
                    (stemAudio) => {
                        stemAudio.audio.addEventListener("timeupdate", () => {
                            const currentTime = stemAudio.audio.currentTime;

                            const shouldBeActive = currentTime > (STEM_TIMES.get(stemAudio.stem) || 0);
                            if (shouldBeActive && stemAudio.audio.volume != 1) {
                                stemAudio.audio.volume = 1;
                            } else if (stemAudio.audio.volume === 1 && !shouldBeActive) {
                                stemAudio.audio.volume = 0
                            }

                        })
                    }
                )
            });


    }, [track.track_id])
    if (!tracksLoaded || !audioTracks) {
        return <div>Loading</div>
    }
    if (tracksLoaded && tracksLoaded.find(v => !v[1])) {
        return <div>
            Loaded {tracksLoaded.filter(v => v[1])}/{tracksLoaded.length}
        </div>
    }

    const play = async () => {
        setIsPlaying(!isPlaying)
        for (const {audio} of audioTracks) {
            if (audio.paused) {
                await audio.play();
            } else {
                audio.pause();
            }
        }
    }
    return (
        <div onClick={play} style={{position:"relative"}}>
            <ProgressBar audioTracks={audioTracks}/>
            {!isPlaying && <div  className={"play-button-overlay"} >
                Play
            </div>}
        </div>
    );
};