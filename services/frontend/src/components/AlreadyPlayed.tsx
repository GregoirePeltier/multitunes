import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {Game, GameService, getGameType} from '../services/GameService';
import {TrackChipView} from './TrackChipView';
import {LoadingScreen} from './LoadingScreen';
import {ShareModal} from "./ShareModal.tsx";
import {Share2} from "lucide-react";
import {PlayedGameDetails} from "../model/PlayedGameDetails.ts";

export const AlreadyPlayed = ({ gameId, genre, score }: { gameId?: string, genre?: string, score: number }) => {
    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(true);
    const [playedDetails, setPlayedDetails] = useState<PlayedGameDetails | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    useEffect(() => {
        const loadGameDetails = async () => {
            try {
                // Load the game details
                const gameService = new GameService();
                let loadedGame;
                if (gameId) {
                    loadedGame = await gameService.getGameById(parseInt(gameId));
                } else {
                    const genreNum = genre ? parseInt(genre) : undefined;
                    loadedGame = await gameService.getDailyGame(genreNum);
                }
                setGame(loadedGame);

                // Get the played game details from localStorage
                const playedGames = JSON.parse(localStorage.getItem('playedGames') || '[]');
                const playedGame = gameId
                    ? playedGames.find(g => g.gameId.toString() === gameId)
                    : playedGames.find(g => {
                        const today = new Date().toISOString().split('T')[0];
                        const gameDate = new Date(g.date).toISOString().split('T')[0];
                        return gameDate === today && g.genre?.toString() === genre;
                    });
                if (playedGame) {
                    setPlayedDetails(playedGame);
                }
            } catch (error) {
                console.error('Failed to load game details:', error);
            } finally {
                setLoading(false);
            }
        };

        loadGameDetails();
    }, [gameId, genre]);

    if (loading || !game) {
        return <div className="loading-area">
            <LoadingScreen loadingState={{ gameLoaded: false, stemLoading: [] }} />
        </div>;
    }

    return (
        <div className="result-view">
            <div className="card primary-bg results-card ">
                <div className="card-title">
                    You've already played this game!
                </div>
                <div className="point-count positive">
                    You won {score} points
                </div>
                <div>
                    {game.questions.map((q, i) => (
                        <TrackChipView
                            key={q.track.id}
                            track={q.track}
                            positive={playedDetails?.points?.[i] !=0}
                            points={playedDetails?.points?.[i] || 0}
                        />
                    ))}
                </div>
            </div>
            <div className="flex justify-center gap-4">
                <button
                        className="button primary-bg flex items-center space-x-2"
                        onClick={() => setIsShareModalOpen(true)}
                    >
                        <Share2 size={20} />
                    </button>
                <ShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    score={score}
                    total={game.questions.length * 8}
                    gameType={getGameType(game.genre)}
                    questionResults={playedDetails?.points || []}
                    gameId={game.id}
                />
                <Link to="/" className="button primary-bg text-">
                    Back
                </Link>
                <Link to="/history" className="button primary-bg">
                    History
                </Link>
            </div>
        </div>
    );
};