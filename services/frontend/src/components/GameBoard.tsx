// @flow
import {MultiTunePlayer} from "./MultiTunePlayer.tsx";
import {useEffect, useState} from "react";
import {Game, GameService} from "../services/GameService.ts";
import {Stem, Track} from "../model/Track.ts";
import {TrackService} from "../services/track_service.ts";
import {AnswerBoard} from "./AnswerBoard.tsx";

export enum GamePhase {
    LOADING = "Loading",
    READY = "Ready",
    PLAYING = "Playing",
    INTERSONG = "Interesong",
    DONE = "Done",
}

function QuestionResult(props: { track: Track, answer: number, onNext: () => void }) {
    const {track, answer, onNext} = props
    return <div className={"question-result"}>
        <div className={"track-card card"}>
            <img className={"track-cover"} src={track.cover} alt=""/>
            <div className={"track-title"}>{track.title}</div>
            <div className={"track-artist"}>{track.artist}</div>

        </div>
        <div>You
            guessed {answer === track.id ? "right" : "wrong"}</div>
        <button className={"button"} onClick={onNext}>Next</button>
    </div>;
}

export function GameBoard() {
    const [game, setGame] = useState<Game | null>();
    const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.LOADING);
    const [currentTrack, setCurrentTrack] = useState(0)
    const [stems, setStems] = useState<Array<Array<Stem>>>([])
    const [playing, setPlaying] = useState<boolean>(false)
    const [answers, setAnswers] = useState<Array<number>>([])
    useEffect(() => {
        if (!game) {
            const gameService = new GameService();
            setGamePhase(GamePhase.LOADING)
            gameService.getNewGame().then((game) => {
                setStems(Array(game.questions.length).map(() => []));
                setAnswers(Array(game.questions.length))
                setGame(game);

                loadMissingStems(game)
            });
        }
    }, []);
    console.log(stems)
    const loadMissingStems = (game: Game) => {
        if (!game) return;
        Promise.all(game.questions.map(async (question, i) => {
            console.log("Loading stems for ", question.track.title)
            const newStems = await TrackService.loadStems(question.track)
            return newStems
        })).then((newStems) => {
            setStems(newStems);
            setGamePhase(GamePhase.READY)
        })
    }
    if (!game || gamePhase === GamePhase.LOADING) {
        return <div>Loading</div>
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
        setCurrentTrack(currentTrack + 1);
        setGamePhase(GamePhase.PLAYING);
    }
    const answer = (id: number) => {
        setAnswers((oldAnswers) => [...oldAnswers.slice(0, currentTrack), id, ...oldAnswers.slice(currentTrack + 1)]);
        setGamePhase(GamePhase.INTERSONG);
    }
    console.log(answers)
    if (gamePhase === GamePhase.LOADING) {
        return <div className={"play-area"}>
            Loading
        </div>
    }
    if (gamePhase === GamePhase.DONE) {
        return <div>
            Well Played
        </div>
    }
    return (
        <div className={"game-board"}>
            {gamePhase !== GamePhase.LOADING &&
                <MultiTunePlayer onReachedEnd={() => {
                    playbackEnded()
                }} isPlaying={playing} stems={stems[currentTrack]}/>
            }
            <div className={"play-area"}>
                {gamePhase === GamePhase.READY &&
                    <div className={"card m-auto"}>
                        <h1>Ready when you are</h1>
                        <button className={"button"} onClick={play}>Play</button>
                    </div>
                }
                {gamePhase === GamePhase.INTERSONG && <QuestionResult track={game.questions[currentTrack].track}
                                                                      answer={answers[currentTrack]} onNext={next}/>
                }
                {gamePhase === GamePhase.PLAYING &&
                    <AnswerBoard question={game.questions[currentTrack]} onAnswer={answer}/>}
            </div>
        </div>
    );
};