// @flow
import {MultiTunePlayer} from "./MultiTunePlayer.tsx";
import {useEffect, useState} from "react";
import {Game, GameService} from "../services/GameService.ts";
import {Stem, StemType, Track} from "../model/Track.ts";
import {TrackService} from "../services/track_service.ts";
import {AnswerBoard} from "./AnswerBoard.tsx";
import {QuestionResult} from "./QuestionResult.tsx";
import {TrackChipView} from "./TrackChipView.tsx";
import {LoadingState} from "./LoadingState.tsx";
import {LoadingScreen} from "./LoadingScreen.tsx";

const gameService = new GameService();

export enum GamePhase {
    UNKNOWN = "UNKNOWN",
    LOADING = "Loading",
    READY = "Ready",
    PLAYING = "Playing",
    INTERSONG = "Interesong",
    DONE = "Done",
}

export function GameBoard() {
    const [game, setGame] = useState<Game | null>();
    const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.UNKNOWN);
    const [currentTrack, setCurrentTrack] = useState(0)
    const [stems, setStems] = useState<Array<Array<Stem>>>([])
    const [loadingState, setLoadingState] = useState<LoadingState | null>(null)
    const [playing, setPlaying] = useState<boolean>(false)
    const [answers, setAnswers] = useState<Array<number>>([])
    const [points, setPoints] = useState<Array<number>>([])
    const [activeStems, setActiveStems] = useState<StemType[]>([])
    useEffect(() => {
        console.log("mouting")
        if (!game && gamePhase === GamePhase.UNKNOWN) {
            let cancel = false
            setGamePhase(GamePhase.LOADING)
            setLoadingState({gameLoaded: false, stemLoading: []})
            gameService.getNewGame().then((game) => {
                if (cancel) return
                setGame(game);
                setLoadingState({gameLoaded: true, stemLoading: new Array(game.questions.length)})
                setStems(Array(game.questions.length).map(() => []));
                setAnswers(Array(game.questions.length))
                setPoints(Array(game.questions.length))
                loadStems(game)
            });
            return () => {
                cancel = true
            }
        }
    }, []);
    const loadNextStems = async (tracks: Array<Track>, iterationIndex: number) => {
        if (tracks.length === 0) return;
        const track = tracks[0];
        const newStems = await TrackService.loadStems(track, (stemLoadings) => {
            setLoadingState((oldState) => {
                if (!oldState) return null;
                const loadings = oldState.stemLoading
                return {
                    ...oldState,
                    stemLoading: [
                        ...loadings.slice(0, iterationIndex), stemLoadings, ...loadings.slice(iterationIndex + 1)
                    ]
                }
            })
        })
        setStems((oldStems) =>
            [...oldStems.slice(0, iterationIndex), newStems, ...oldStems.slice(iterationIndex + 1)])
        setGamePhase((phase) => {
            if (phase === GamePhase.LOADING || phase === GamePhase.UNKNOWN) {
                setPlaying(false)
                return GamePhase.READY
            }
            return phase
        })
        await loadNextStems(tracks.slice(1), iterationIndex + 1)
    }
    const loadStems = (game: Game) => {
        if (!game) return;
        console.log("Start Loadgin")
        loadNextStems(game.questions.map(q => q.track), 0)
    }
    const playbackEnded = () => {
        return
        if (currentTrack === game.questions.length - 1) {
            setGamePhase(GamePhase.DONE);
        } else {
            setGamePhase(GamePhase.INTERSONG);
        }
    }
    const play = () => {
        setGamePhase(GamePhase.PLAYING);
        setPlaying(true);
    };
    const next = () => {
        if (currentTrack === game.questions.length - 1) {
            setGamePhase(GamePhase.DONE)
        } else {
            if (!loadingState || loadingState.stemLoading[currentTrack + 1].some((loading) => !loading.loaded)
                || !stems[currentTrack + 1] || stems[currentTrack + 1].length === 0
            ) {
                setGamePhase(GamePhase.LOADING)
            } else {
                setGamePhase(GamePhase.PLAYING);
            }
            setCurrentTrack(currentTrack + 1);

        }
    }
    const answer = (id: number) => {
        let points = 0;
        if (id === game.questions[currentTrack].track.id) {
            points = 10 - Math.max(0, (activeStems.length - 1));
        }
        setPoints((oldPoints) => [...oldPoints.slice(0, currentTrack), points, ...oldPoints.slice(currentTrack + 1)])
        setAnswers((oldAnswers) => [...oldAnswers.slice(0, currentTrack), id, ...oldAnswers.slice(currentTrack + 1)]);
        setGamePhase(GamePhase.INTERSONG);
    }
    const again = () => {
        window.location.reload()
    }

    if (!game || gamePhase === GamePhase.LOADING || gamePhase === GamePhase.UNKNOWN) {
        return <div className={"loading-area"}>
            <LoadingScreen loadingState={loadingState}/>
        </div>
    }
    if (gamePhase === GamePhase.DONE) {
        const total = points.reduce((previousValue, currentValue) => previousValue + currentValue)
        return <div className={"result-view"}>
            <div className={"card primary-bg"}>
                <div className={"card-title"}>
                    Well Done
                </div>
                <div className={"point-count positive"}>
                    You won {total} points
                </div>
                <div>
                    {game.questions.map((q, i) => <TrackChipView track={q.track} positive={answers[i] === q.track.id}
                                                                 points={points[i]}/>)}
                </div>
            </div>
            <div style={{display: "flex", justifyContent: "center"}}>
                <button className={"button primary-bg"} onClick={again}>Play Again !</button>
            </div>
        </div>
    }
    return (
        <div className={"game-board"}>
            {gamePhase !== GamePhase.LOADING &&
                <MultiTunePlayer onStemActive={(stems) => {
                    setActiveStems(stems)
                }} onReachedEnd={() => {
                    playbackEnded()
                }} isPlaying={playing} stems={stems[currentTrack]}/>
            }
            <div className={"play-area"}>
                {gamePhase === GamePhase.READY &&
                    <div className={"card m-auto"}>
                        <h1>Ready when you are</h1>
                        <button className={"button primary-bg"} onClick={play}>Play</button>
                    </div>
                }
                {gamePhase === GamePhase.INTERSONG && <QuestionResult track={game.questions[currentTrack].track}
                                                                      points={points[currentTrack]} onNext={next}
                                                                      done={currentTrack === game.questions.length}/>
                }
                {gamePhase === GamePhase.PLAYING &&
                    <AnswerBoard question={game.questions[currentTrack]} onAnswer={answer}/>}
            </div>
        </div>
    );
};