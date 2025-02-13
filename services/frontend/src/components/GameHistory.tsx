import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {GameGenre, GameService} from '../services/GameService';
import {PlayedGameDetails} from "../model/PlayedGameDetails.ts";

const gameService = new GameService();


interface DayGames {
    date: string;
    games: {
        genre?: GameGenre;
        gameId: number;
        score?: number;
    }[];
}

const getScoreColor = (score: number) => {
    if (score >= 25) return 'bg-green-500 hover:bg-green-600';
    if (score >= 15) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-amber-700 text-white border hover:bg-amber-800';
};

const getGenreName = (genre?: GameGenre) => {
    if (!genre) return 'All';
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

export const GameHistory = () => {
    const [gamesByDay, setGamesByDay] = useState<DayGames[]>([]);

    useEffect(() => {
        const loadGames = async () => {
            // Load played games from localStorage
            const storedGames: PlayedGameDetails[] = JSON.parse(localStorage.getItem('playedGames') || '[]');

            // Fetch available games
            const availableGames = await gameService.getAvailableGames();

            // Combine and organize games by date
            const gamesMap = new Map<string, DayGames>();
            const playedGames = new Map<number, PlayedGameDetails>();
            storedGames.forEach((g) => playedGames.set(g.gameId, g));
            // Process available games
            availableGames.forEach(game => {
                const date = new Date(game.date).toISOString().split('T')[0];
                if (!gamesMap.has(date)) {
                    gamesMap.set(date, {date, games: []});
                }

                gamesMap.get(date)?.games.push({
                    genre: game.genre,
                    gameId: game.id,
                    score: playedGames.get(game.id)?.score,
                });
            });


            // Sort by date descending
            const sortedGames = Array.from(gamesMap.values())
                .sort((a, b) => b.date.localeCompare(a.date));

            setGamesByDay(sortedGames);
        };
        loadGames();
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className={"flex justify-between items-center mb-2"}>
                <h2 className="text-2xl font-bold text-center">Game History</h2>
                <div>
                    <div className={"text-xs items-center text-center"}>Scores</div>
                    <div className={"grid grid-cols-3 text-xs text-center items-center"}>

                        <div className={"text-white rounded m-0.5 p-0.5 " + getScoreColor(0)}> &gt;0</div>
                        <div className={"text-white rounded m-0.5 p-0.5 " + getScoreColor(15)}> &gt;15</div>
                        <div className={"text-white rounded m-0.5 p-0.5 " + getScoreColor(25)}> &gt;25</div>
                    </div>
                </div>

            </div>

            <div className="overflow-hidden rounded-lg ">
                <table className="min-w-full bg-white">
                    <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm leading-normal">
                        <th className="text-left pl-1">Date</th>
                        <th className="py-3 px-6 text-right">Available Games</th>
                    </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                    {gamesByDay.map(({date, games}) => (
                        <tr key={date} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="pl-1">
                                {new Date(date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-6">
                                <div className="grid grid-cols-4  justify-end gap-1">
                                    {games.map(game => (
                                        <Link
                                            key={`${game.gameId}-${game.genre}`}
                                            to={`/play/${game.gameId}`}
                                            className={`inline-flex items-center text-center px-0.5 py-0.5 text-xs font-medium rounded text-white 
                                                    ${game.score !== undefined
                                                ? getScoreColor(game.score)
                                                : 'primary-bg hover:bg-gray-600'}`}
                                        >
                                            {getGenreName(game.genre)}
                                        </Link>
                                    ))}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GameHistory;