import {BrowserRouter, Routes, Route, Link} from 'react-router-dom';
import {GameBoard} from "./components/GameBoard.tsx";
import "./App.css"

const AppLayout = ({children}) => (
    <div className="min-h-screen">
        <nav className="header shadow-lg">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-xl font-bold text-white">MultiTunes</Link>
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
    <div className={"home"}>
        <div className="home-card">
            <div className="text-xl ">6 Instruments</div>
            <div className="text-xl ">5 Choices</div>
            <div className="text-xl ">1 Song</div>
            <div>
                Can you guess the right one
                before the end?
            </div>
        </div>
        <Link to="/play" className="play-button">
                Start Playing
            </Link>
            <div>Or play with theses genres (still in beta)</div>

        <div className={"genre-list"}>
            <Link className={"button"} to={"/play/152"}>Rock</Link>
            <Link className={"button"} to={"/play/132"}>Pop</Link>
            <Link className={"button"} to={"/play/116"}>Rap</Link>
            <Link className={"button"} to={"/play/464"}>Metal</Link>
            <Link className={"button"} to={"/play/165"}>RNB</Link>
            <Link className={"button"} to={"/play/466"}>Folk</Link>
            <Link className={"button"} to={"/play/84"}>Country</Link>
            <Link className={"button"} to={"/play/52"}>French</Link>
            <Link className={"button"} to={"/play/169"}>Soul</Link>
            <Link className={"button"} to={"/play/153"}>Blues</Link>
        </div>
    </div>
);

const Play = () => (
    <GameBoard/>
);

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/*" element={
                    <AppLayout>
                        <Routes>
                            <Route index element={<Home/>}/>
                            <Route path="play/:genre" element={<Play/>}/>
                            <Route path="play/" element={<Play/>}/>
                            <Route path="*" element={
                                <div className="text-center py-12">
                                    <h2 className="text-2xl font-bold mb-4">404 - Page Not Found</h2>
                                    <Link to="/" className="text-blue-500 hover:text-blue-600">
                                        Return to Home
                                    </Link>
                                </div>
                            }/>
                        </Routes>
                    </AppLayout>
                }/>
            </Routes>
        </BrowserRouter>
    );
};

export default App;