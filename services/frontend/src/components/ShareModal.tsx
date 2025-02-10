import React, {useEffect} from 'react';
import {Twitter, Facebook, Linkedin, Link2, X, MessageCircle, MessageSquare} from 'lucide-react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    score: number;
    total: number;
    gameType: string;
    questionResults: number[];
    onShare?: (platform: string) => void;
    gameId:number;
}

export function ShareModal({isOpen, onClose, score, total, gameType, questionResults, onShare,gameId}: ShareModalProps) {
    // Handle ESC key press
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const generateEmojiPattern = (questionResults: number[]) => {
        return questionResults.map(points => {
            if (points === 0) return '⬛'; // Miss
            if (points >= 7) return '🟩'; // Not Perfect but good
            return '🟨'; // Partial (needed more stems)
        }).join('');
    };

    const shareText = `🎵 MultiTunes ${gameType} Challenge\n${score}/${total} points!\n${generateEmojiPattern(questionResults)}\nPlay now at https://multitunes.app/play/${gameId}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
            if(onShare)onShare('clipboard');
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
        discord: `https://discord.com/channels/@me?message=${encodeURIComponent(shareText)}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent('https://multitunes.app')}&title=${encodeURIComponent(shareText)}`,
        threads: `https://threads.net/intent/post?text=${encodeURIComponent(shareText)}`,
        bluesky: `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText)}`
    };

    const handleShare = (platform: string) => {
        copyToClipboard();
        if(onShare)onShare(platform);
        window.open(shareUrls[platform], '_blank');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Share Your Score!</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        <X size={24}/>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 my-4">
                    <button
                        onClick={() => handleShare('twitter')}
                        className="flex items-center justify-center space-x-2 p-3 rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-colors"
                    >
                        <Twitter size={20}/>
                        <span>Twitter</span>
                    </button>

                    <button
                        onClick={() => handleShare('bluesky')}
                        className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-white hover:bg-sky-600 transition-colors"
                    >
                        <svg style={{maxHeight: "20"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path
                                d="M111.8 62.2C170.2 105.9 233 194.7 256 242.4c23-47.6 85.8-136.4 144.2-180.2c42.1-31.6 110.3-56 110.3 21.8c0 15.5-8.9 130.5-14.1 149.2C478.2 298 412 314.6 353.1 304.5c102.9 17.5 129.1 75.5 72.5 133.5c-107.4 110.2-154.3-27.6-166.3-62.9l0 0c-1.7-4.9-2.6-7.8-3.3-7.8s-1.6 3-3.3 7.8l0 0c-12 35.3-59 173.1-166.3 62.9c-56.5-58-30.4-116 72.5-133.5C100 314.6 33.8 298 15.7 233.1C10.4 214.4 1.5 99.4 1.5 83.9c0-77.8 68.2-53.4 110.3-21.8z"/>
                        </svg>
                        <span>Bluesky</span>
                    </button>

                    <button
                        onClick={() => handleShare('threads')}
                        className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-black text-white hover:bg-gray-900 transition-colors"
                    >
                        <i class="fa-brands fa-threads"></i>
                        <span>Threads</span>
                    </button>

                    <button
                        onClick={() => handleShare('facebook')}
                        className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        <Facebook size={20}/>
                        <span>Facebook</span>
                    </button>
                    <button
                        onClick={() => handleShare('discord')}
                        className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                        <MessageSquare size={20}/>
                        <span>Discord</span>
                    </button>
                    <button
                        onClick={copyToClipboard}
                        className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors"
                    >
                        <Link2 size={20}/>
                        <span>Copy Text</span>
                    </button>
                </div>

                <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-white">
                        {shareText}
                    </pre>
                </div>
            </div>
        </div>
    );
}