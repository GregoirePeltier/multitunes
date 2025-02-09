// @flow
import {MultiTunePlayer} from "./MultiTunePlayer.tsx";
import {useEffect, useState} from "react";
import {Game, GameService} from "../services/GameService.ts";
import {Stem} from "../model/Track.ts";
import {TrackService} from "../services/track_service.ts";
import {AnswerBoard} from "./AnswerBoard.tsx";
import {QuestionResult} from "./QuestionResult.tsx";
import {TrackChipView} from "./TrackChipView.tsx";
import {useNavigate} from "react-router-dom";

export enum GamePhase {
    LOADING = "Loading",
    READY = "Ready",
    PLAYING = "Playing",
    INTERSONG = "Interesong",
    DONE = "Done",
}

export function GameBoard() {
    const navigate = useNavigate();
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
        if (currentTrack === game.questions.length - 1) {
            setGamePhase(GamePhase.DONE)
        } else {
            setCurrentTrack(currentTrack + 1);
            setGamePhase(GamePhase.PLAYING);
        }
    }
    const answer = (id: number) => {
        setAnswers((oldAnswers) => [...oldAnswers.slice(0, currentTrack), id, ...oldAnswers.slice(currentTrack + 1)]);
        setGamePhase(GamePhase.INTERSONG);
    }
    const again = ()=>{
        window.location.reload()
    }
    if (gamePhase === GamePhase.LOADING) {
        return <div className={"play-area"}>
            Loading
        </div>
    }
    if (gamePhase === GamePhase.DONE) {
        const points = game.questions.map<number>((q,i)=>q.track.id===answers[i]?10:0).reduce((previousValue, currentValue) => previousValue+currentValue)
        return <div className={"result-view"}>
            <div className={"card primary-bg"}>
                <div className={"card-title"}>
                    Well Done
                </div>
                <div className={"point-count positive"}>
                    You won {points} points
                </div>
                <div>
                    {game.questions.map((q,i)=><TrackChipView track={q.track} positive={answers[i]===q.track.id}/>)}
                </div>
            </div>
            <div style={{display:"flex", justifyContent:"center"}}>
                <button className={"button primary-bg"} onClick={again}>Play Again ! </button>
            </div>
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
                        <button className={"button primary-bg"} onClick={play}>Play</button>
                    </div>
                }
                {gamePhase === GamePhase.INTERSONG && <QuestionResult track={game.questions[currentTrack].track}
                                                                      answer={answers[currentTrack]} onNext={next}
                                                                      done={currentTrack === game.questions.length}/>
                }
                {gamePhase === GamePhase.PLAYING &&
                    <AnswerBoard question={game.questions[currentTrack]} onAnswer={answer}/>}
            </div>
        </div>
    );
};