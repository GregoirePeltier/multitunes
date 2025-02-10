import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GameGenre, GameService, AvailableGame } from '../services/GameService';

const gameService = new GameService();

interface GameHistory {
    gameId: number;
    date: string;
    genre?: GameGenre;
    score: number;
}

export const GameHistory = () => {
    const [availableGames, setAvailableGames] = useState<AvailableGame[]>([]);
    const [playedGames, setPlayedGames] = useState<GameHistory[]>([]);

    useEffect(() => {
        // Load played games from localStorage
        const storedGames = localStorage.getItem('playedGames');
        if (storedGames) {
            setPlayedGames(JSON.parse(storedGames));
        }

        // Fetch available games
        gameService.getAvailableGames()
            .then(games => setAvailableGames(games))
            .catch(error => console.error('Failed to fetch available games:', error));
    }, []);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString();
    };

    const getGenreName = (genre?: GameGenre) => {
        if (!genre) return 'General';
        const genres: { [key in GameGenre]: string } = {
            [GameGenre.POP]: 'Pop',
            [GameGenre.ROCK]: 'Rock',
            [GameGenre.METAL]: 'Metal',
            [GameGenre.RAP]: 'Rap',
            [GameGenre.RNB]: 'R&B',
            [GameGenre.FOLK]: 'Folk',
            [GameGenre.COUNTRY]: 'Country',
            [GameGenre.FRENCH]: 'French',
            [GameGenre.SOUL]: 'Soul',
            [GameGenre.BLUES]: 'Blues'
        };
        return genres[genre] || 'Unknown';
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">Game History</h2>

            <div className="grid gap-6">
                <div className="card primary-bg p-4">
                    <h3 className="text-xl font-semibold mb-4">Your Played Games</h3>
                    <div className="space-y-2">
                        {playedGames.map((game) => (
                            <div key={`${game.gameId}-${game.genre}`}
                                 className="flex justify-between items-center p-2 bg-opacity-10 bg-white rounded">
                                <div>
                                    <span className="font-medium">{formatDate(game.date)}</span>
                                    <span className="mx-2">•</span>
                                    <span>{getGenreName(game.genre)}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold">{game.score} points</span>
                                </div>
                            </div>
                        ))}
                        {playedGames.length === 0 && (
                            <p className="text-center py-4">No games played yet</p>
                        )}
                    </div>
                </div>

                <div className="card primary-bg p-4">
                    <h3 className="text-xl font-semibold mb-4">Available Games</h3>
                    <div className="space-y-2">
                        {availableGames.map((game) => (
                            <Link
                                key={`${game.id}-${game.genre}`}
                                to={`/play/${game.id}`}
                                className="flex justify-between items-center p-2 bg-opacity-10 bg-white rounded hover:bg-opacity-20 transition-all"
                            >
                                <div>
                                    <span className="font-medium">{formatDate(game.date)}</span>
                                    <span className="mx-2">•</span>
                                    <span>{getGenreName(game.genre)}</span>
                                </div>
                                <div>
                                    <span className="text-sm">Play →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameHistory;