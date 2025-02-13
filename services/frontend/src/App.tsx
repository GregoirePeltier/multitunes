import {BrowserRouter, Link, Route, Routes} from 'react-router-dom';
import {GameBoard} from "./components/GameBoard.tsx";
import {GameHistory} from "./components/GameHistory.tsx";
import "./App.css";
import {CircleHelp} from "lucide-react";
import {useState} from "react";
import HelpModal from "./components/HelpModal.tsx";

const AppLayout = ({children}) => {
    const [helpIsVisible, setHelpIsVisible] = useState<boolean>(false);
    const openHelp=()=>{
        setHelpIsVisible(true)
    }
    return <div className="min-h-screen flex flex-col">
        <nav className="header shadow-lg">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="text-xl font-bold text-white">MultiTunes</Link>
                        <Link to="/history" className="rounded-full bg-white text-primary px-2">History</Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div onClick={openHelp}> <CircleHelp /></div>
                    </div>
                </div>
            </div>
        </nav>
        <main className="body flex-grow">
            {children}
        </main>
        {helpIsVisible && <HelpModal isOpen={helpIsVisible} onClose={()=>setHelpIsVisible(false)}/>}
    </div>
}
const Home = () => (
    <div className="home">
        <div className="home-card">
            <div className="text-xl">6 Instruments</div>
            <div className="text-xl">5 Choices</div>
            <div className="text-xl">1 Song</div>
            <div>Can you guess the song before the end?</div>
        </div>

        <div className="flex flex-col items-center space-y-8">
            <div className="space-y-4 flex flex-col items-center">
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
        <footer className="footer py-2 text-sm">
            <div className="max-w-6xl mx-auto px-4 flex justify-center items-center space-x-2">
                <span>Made by GPeltier</span>
                <a href="https://www.linkedin.com/in/greg-peltier/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    <svg className="w-4 h-4 inline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                        <rect x="2" y="9" width="4" height="12"/>
                        <circle cx="4" cy="4" r="2"/>
                    </svg>
                </a>
                <a href="https://linktr.ee/gpeltier" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    <svg className="w-4 h-4 inline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                </a>
            </div>
        </footer>
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