import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { GameBoard } from "./components/GameBoard.tsx";
import { GameHistory } from "./components/GameHistory.tsx";
import "./App.css";

const AppLayout = ({children}) => (
    <div className="min-h-screen">
        <nav className="header shadow-lg">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="text-xl font-bold text-white">MultiTunes</Link>
                        <Link to="/history" className="text-white hover:text-gray-200">History</Link>
                    </div>
                </div>
            </div>
        </nav>
        <main className="body">
            {children}
        </main>
    </div>
);

const Home = () => (
    <div className="home">
        <div className="home-card">
            <div className="text-xl">6 Instruments</div>
            <div className="text-xl">5 Choices</div>
            <div className="text-xl">1 Song</div>
            <div>Can you guess the right one before the end?</div>
        </div>

        <div className="flex flex-col items-center space-y-8">
            <div className="space-y-4">
                <Link to="/play/daily" className="play-button block text-center">
                    Play Today's Challenge
                </Link>
                <Link to="/history" className="button block text-center">
                    View Past Challenges
                </Link>
            </div>

            <div className="text-center">
                <div className="mb-4">Or try a genre-specific challenge:</div>
                <div className="genre-list">
                    <Link className="button" to="/play/daily/152">Rock</Link>
                    <Link className="button" to="/play/daily/132">Pop</Link>
                    <Link className="button" to="/play/daily/116">Rap</Link>
                    <Link className="button" to="/play/daily/464">Metal</Link>
                    <Link className="button" to="/play/daily/165">RNB</Link>
                    <Link className="button" to="/play/daily/466">Folk</Link>
                    <Link className="button" to="/play/daily/84">Country</Link>
                    <Link className="button" to="/play/daily/52">French</Link>
                    <Link className="button" to="/play/daily/169">Soul</Link>
                    <Link className="button" to="/play/daily/153">Blues</Link>
                </div>
            </div>
        </div>
    </div>
);

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/*" element={
                    <AppLayout>
                        <Routes>
                            <Route index element={<Home />} />
                            <Route path="play/daily/:genre?" element={<GameBoard />} />
                            <Route path="play/:gameId" element={<GameBoard />} />
                            <Route path="history" element={<GameHistory />} />
                            <Route path="*" element={
                                <div className="text-center py-12">
                                    <h2 className="text-2xl font-bold mb-4">404 - Page Not Found</h2>
                                    <Link to="/" className="text-blue-500 hover:text-blue-600">
                                        Return to Home
                                    </Link>
                                </div>
                            } />
                        </Routes>
                    </AppLayout>
                } />
            </Routes>
        </BrowserRouter>
    );
};

export default App;