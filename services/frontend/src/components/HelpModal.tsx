import {X} from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const HelpModal = ({isOpen, onClose}: Props) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">How to Play</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24}/>
                    </button>
                </div>

                {/* Game Tutorial */}
                <div className="space-y-6 text-gray-200">
                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Game Rules</h3>
                        <ul className="list-disc text-sm pl-6 space-y-2">
                            <li>Each challenge features one song split into 6 different instrument tracks</li>
                            <li>Tracks are revealed progressively over 30 seconds</li>
                            <li>Your goal is to identify the correct song from 5 possible choices</li>
                            <li>The faster you guess, the more points you earn (maximum 8 points)</li>
                            <li>Each new instrument reduces your potential points by 1</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Instrument Order</h3>
                        <div className="table grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">🎹</span>
                                <span>Piano (Start) </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">🎶</span>
                                <span>Other (Start)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">🎸</span>
                                <span>Bass (5s)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">🥁</span>
                                <span>Drums (10s)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">🎸</span>
                                <span>Guitar (15s)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">🎤</span>
                                <span>Vocals (20s)</span>
                            </div>

                        </div>
                    </section>

                    <div className="border-t border-gray-600 my-6"></div>

                    {/* About Section */}
                    <section className="space-y-3 text-sm">
                        <h3 className="text-lg font-semibold text-white">About</h3>
                        <p>
                            Multitunes is built using: </p>
                        <div>- Tracks from <a className={"text-sky-600"} href={"https://www.deezer.com"}>Deezer</a>
                        </div>
                        <div> - And processing using <a className={"text-sky-600"}
                            href="https://github.com/facebookresearch/demucs">Demucs</a></div>
                        <p className="text-sm text-gray-400">
                            Created by gpeltier • Built with React Node and Python
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;