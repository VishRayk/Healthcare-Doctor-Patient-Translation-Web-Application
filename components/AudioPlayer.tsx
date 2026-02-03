import React, { useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from './ui/button';

export function AudioPlayer({ src }: { src: string }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="flex items-center gap-2 mb-2">
            <audio
                ref={audioRef}
                src={src}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                className="hidden"
            />
            <button
                type="button"
                onClick={togglePlay}
                className="flex items-center gap-2 text-xs bg-black/10 dark:bg-white/10 px-2 py-1 rounded-full hover:bg-black/20"
            >
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                <span>{isPlaying ? 'Playing...' : 'Play Audio'}</span>
            </button>
        </div>
    );
}
