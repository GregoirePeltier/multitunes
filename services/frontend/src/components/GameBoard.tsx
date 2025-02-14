import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {Game, GameService, GameGenre, getGameType} from "../services/GameService";
import {MultiTunePlayer} from "./MultiTunePlayer";
import {AnswerBoard} from "./AnswerBoard";
import {QuestionResult} from "./QuestionResult";
import {LoadingScreen} from "./LoadingScreen";
import {ShareModal} from "./ShareModal";
import {AlreadyPlayed} from "./AlreadyPlayed";

import {Stem, StemType, Track} from "../model/Track";
import {TrackService} from "../services/track_service";
import {LoadingState} from "./LoadingState";
import {Share2} from 'lucide-react';
import {Utils} from "../utils";
import {TrackChipView} from "./TrackChipView.tsx";

const gameService = new GameService();

export enum GamePhase {
    UNKNOWN = "UNKNOWN",
    LOADING = "Loading",
    READY = "Ready",
    PLAYING = "Playing",
    INTERSONG = "Intersong",
    DONE = "Done",
    ALREADY_PLAYED = "AlreadyPlayed"
}

interface PlayedGame {
    gameId: string | number;
    date: string;
    genre?: GameGenre;
    score: number;
}

export function GameBoard() {
    const {gameId, genre} = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState<Game | null>(null);
    const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.UNKNOWN);
    const [currentTrack, setCurrentTrack] = useState(0);
    const [stems, setStems] = useState<Array<Array<Stem>>>([]);
    const [loadingState, setLoadingState] = useState<LoadingState | null>(null);
    const [playing, setPlaying] = useState<boolean>(false);
    const [answers, setAnswers] = useState<Array<number | null>>([]);
    const [points, setPoints] = useState<Array<number>>([]);
    const [activeStems, setActiveStems] = useState<StemType[]>([]);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [previousScore, setPreviousScore] = useState<number>(0);

    // Check if the game has been played before
    const checkIfPlayed = (): PlayedGame | undefined => {
        const playedGames: PlayedGame[] = JSON.parse(localStorage.getItem('playedGames') || '[]');
        if (gameId) {
            return playedGames.find(g => g.gameId.toString() === gameId);
        } else {
            // For daily challenges, check if played today
            const today = new Date().toISOString().split('T')[0];
            return playedGames.find(g => {
                const gameDate = new Date(g.date).toISOString().split('T')[0];
                return gameDate === today && g.genre?.toString() === genre;
            });
        }
    };

    useEffect(() => {
        if (!game && gamePhase === GamePhase.UNKNOWN) {
            // Check if game was already played
            const playedGame = checkIfPlayed();
            if (playedGame) {
                setPreviousScore(playedGame.score);
                setGamePhase(GamePhase.ALREADY_PLAYED);
                return;
            }

            let cancel = false;
            setGamePhase(GamePhase.LOADING);
            setLoadingState({gameLoaded: false, stemLoading: []});

            const loadGame = async () => {
                try {
                    let loadedGame;
                    if (gameId) {
                        loadedGame = await gameService.getGameById(parseInt(gameId));
                    } else {
                        const genreNum = genre ? parseInt(genre) as GameGenre : undefined;
                        loadedGame = await gameService.getDailyGame(genreNum);
                    }
                    loadedGame.questions.forEach(q => q.answers = Utils.shuffleArray(q.answers));
                    if (cancel) return;
                    umami.track('game-load', {gameId: gameId, genre: genre});

                    setGame(loadedGame);
                    setLoadingState({
                        gameLoaded: true,
                        stemLoading: new Array(loadedGame.questions.length)
                    });
                    setStems(Array(loadedGame.questions.length).map(() => []));
                    setAnswers(Array(loadedGame.questions.length));
                    setPoints(Array(loadedGame.questions.length));
                    loadStems(loadedGame);
                } catch (error) {
                    console.error('Failed to load game:', error);
                    setGamePhase(GamePhase.UNKNOWN);
                }
            };

            loadGame();
            return () => {
                cancel = true;
            };
        }
    }, [gameId, genre]);

    // Save game results to localStorage when done
    useEffect(() => {
        if (gamePhase === GamePhase.DONE && game) {
            const totalPoints = points.map(p => p || 0).reduce((sum, p) => sum + p, 0);
            const gameHistory = JSON.parse(localStorage.getItem('playedGames') || '[]');

            const newGame = {
                gameId: game.id,
                date: new Date().toISOString(),
                genre: genre ? parseInt(genre) as GameGenre : undefined,
                score: totalPoints || 0,
                points: points.map(p => p || 0),
            };

            localStorage.setItem('playedGames',
                JSON.stringify([newGame, ...gameHistory].slice(0, 100)));
        }
    }, [gamePhase, game, points, gameId, genre]);

    const loadNextStems = async (tracks: Array<Track>, iterationIndex: number) => {
        if (tracks.length === 0) return;
        const start_time = Date.now();
        const track = tracks[0];
        const newStems = await TrackService.loadStems(track, (stemLoadings) => {
            setLoadingState((oldState) => {
                if (!oldState) return null;
                const loadings = oldState.stemLoading;
                return {
                    ...oldState,
                    stemLoading: [
                        ...loadings.slice(0, iterationIndex),
                        stemLoadings,
                        ...loadings.slice(iterationIndex + 1)
                    ]
                };
            });
        });
        umami.track('game-load-track', {time: Date.now() - start_time, gameId: game?.id, genre: game?.genre});

        setStems((oldStems) => [
            ...oldStems.slice(0, iterationIndex),
            newStems,
            ...oldStems.slice(iterationIndex + 1)
        ]);

        setGamePhase((phase) => {
            if (phase === GamePhase.LOADING || phase === GamePhase.UNKNOWN) {
                setPlaying(false);
                return GamePhase.READY;
            }
            return phase;
        });

        await loadNextStems(tracks.slice(1), iterationIndex + 1);
    };


    const loadStems = (game: Game) => {
        if (!game) return;
        const start_time = Date.now();
        loadNextStems(game.questions.map(q => q.track), 0).then(() => {
            umami.track('game-load-stems', {time: Date.now() - start_time, gameId: game.id, genre: game.genre});
        });
    };
    const playbackEnded = () => {
        if (!game) return;
        if (gamePhase === GamePhase.INTERSONG) {
            return;
        }
        if (GamePhase.PLAYING === gamePhase && (answers[currentTrack] === undefined)) {
            answer(null)
        }
        if (currentTrack === game.questions.length - 1) {
            setGamePhase(GamePhase.DONE);
        } else {

            setGamePhase(GamePhase.INTERSONG);
        }
    };

    const play = () => {
        setGamePhase(GamePhase.PLAYING);
        setPlaying(true);
    };

    const next = () => {
        if (!game) return;
        if (currentTrack === game.questions.length - 1) {
            umami.track('game-complete', {gameId: game.id, genre: game.genre});
            setGamePhase(GamePhase.DONE);
        } else {
            if (!loadingState ||
                loadingState.stemLoading[currentTrack + 1]?.some(loading => !loading.loaded) ||
                !stems[currentTrack + 1] ||
                stems[currentTrack + 1].length === 0
            ) {
                setGamePhase(GamePhase.LOADING);
            } else {
                setGamePhase(GamePhase.PLAYING);
            }
            setCurrentTrack(currentTrack + 1);
        }
    };
    const answer = (id: number | null) => {
        if (!game) return;
        let points = 0;
        if (id === game.questions[currentTrack].track.id) {
            points= 8;
            if(activeStems.includes(StemType.BASS)) points = 7;
            if(activeStems.includes(StemType.DRUMS))points=6;
            if(activeStems.includes(StemType.GUITAR))points=5;
            if(activeStems.includes(StemType.VOCALS))points=4;
        }
        setPoints(oldPoints => [
            ...oldPoints.slice(0, currentTrack).map(p => p || 0),
            points,
            ...oldPoints.slice(currentTrack + 1).map(p => p || 0)
        ]);
        setAnswers(oldAnswers => [
            ...oldAnswers.slice(0, currentTrack),
            id,
            ...oldAnswers.slice(currentTrack + 1)
        ]);
        setGamePhase(GamePhase.INTERSONG);
    };

    if (gamePhase === GamePhase.ALREADY_PLAYED) {
        return <AlreadyPlayed gameId={gameId} genre={genre} score={previousScore}/>;
    }
    const again = () => {
        navigate('/');
    };
    const handleShare = (platform: string) => {
        umami.track('share', {platform});
        // You can add analytics tracking here if needed
        console.log(`Shared on ${platform}`);
    };
    if (!game || gamePhase === GamePhase.LOADING || gamePhase === GamePhase.UNKNOWN) {
        return (
            <div className="loading-area">
                <LoadingScreen loadingState={loadingState}/>
            </div>
        );
    }

    if (gamePhase === GamePhase.DONE) {
        const total = points.reduce((sum, p) => sum + p, 0);
        return (
            <div className="result-view">
                <div className="card primary-bg scroll-auto results-card">
                    <div className="card-title">Well Done</div>
                    <div className="point-count positive">You won {total} points</div>
                    <div>
                        {game.questions.map((q, i) => (
                            <TrackChipView
                                key={q.track.id}
                                track={q.track}
                                positive={answers[i] === q.track.id}
                                points={points[i]}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex justify-center">
                    <button
                        className="button primary-bg flex flex-row "
                        onClick={() => setIsShareModalOpen(true)}
                    >
                        <Share2 size={20}/>
                        <span>Share</span>
                    </button>
                    <button className="button primary-bg" onClick={again}>
                        Back to Home
                    </button>
                </div>
                <ShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    score={total}
                    total={game.questions.length * 8}
                    gameType={getGameType(game.genre)}
                    questionResults={points}
                    onShare={handleShare}
                    gameId={game.id}
                />
            </div>
        );
    }

    return (
        <div className="game-board">
            {gamePhase !== GamePhase.LOADING && (
                <MultiTunePlayer
                    onStemActive={(stems)=>setActiveStems(stems)}
                    onReachedEnd={()=>playbackEnded()}
                    isPlaying={playing}
                    stems={stems[currentTrack]}
                    points={points[currentTrack]}
                />
            )}
            <div className="play-area">
                {gamePhase === GamePhase.READY && (
                    <div className="card m-auto">
                        <h1 className={"text-center"}>Ready when you are</h1>
                        <div className={"card-content flex flex-col"}>
                            <button className="button primary-bg m-0" onClick={play}>
                                Play
                            </button>
                        </div>
                    </div>
                )}
                {gamePhase === GamePhase.INTERSONG && (
                    <QuestionResult
                        track={game.questions[currentTrack].track}
                        points={points[currentTrack]}
                        onNext={next}
                        done={currentTrack === game.questions.length - 1}
                    />
                )}
                {gamePhase === GamePhase.PLAYING && (
                    <AnswerBoard
                        question={game.questions[currentTrack]}
                        onAnswer={answer}
                    />
                )}
            </div>
        </div>
    );
}