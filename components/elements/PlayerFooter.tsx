'use client';

import { useUserStore } from "@/lib/store";
import Image from "next/image";
import { Button } from "../ui/button";
import { XIcon, PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";


export default function PlayerFooter() {
    const { 
        isPlayerVisible, 
        activeTrack, 
        isTrackLoading,
        hidePlayer, 
        playNext, 
        playPrevious,
    } = useUserStore();
    
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5); // Start at 50% volume
    const [lastVolume, setLastVolume] = useState(0.5);

    // Effect to handle track changes and auto-play
    useEffect(() => {
        if (activeTrack?.url && audioRef.current) {
            audioRef.current.src = activeTrack.url;
            audioRef.current.volume = volume; // Set initial volume for the new track
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(e => console.error("Error playing audio:", e));
        }
    }, [activeTrack?.url]); // Dependency on volume is removed to avoid re-triggering on volume change

    if (!isPlayerVisible || !activeTrack) {
        return null;
    }

    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    };

    const handleVolumeChange = (newVolume: number[]) => {
        const vol = newVolume[0];
        setVolume(vol);
        if (audioRef.current) {
            audioRef.current.volume = vol;
        }
    };
    
    const toggleMute = () => {
        if (volume > 0) {
            setLastVolume(volume);
            handleVolumeChange([0]);
        } else {
            handleVolumeChange([lastVolume]);
        }
    };

    const imageUrl = activeTrack.album?.images?.[0]?.url;

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
            {/* Hidden Audio Element */}
            <audio 
                ref={audioRef}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={playNext}
                // preload="auto" is the default and good for this use case
            />

            <div className="container mx-auto flex items-center justify-between">
                {/* Track Info */}
                <div className="flex items-center gap-4 min-w-0">
                    {imageUrl && (
                        <Image src={imageUrl} alt={activeTrack.album.name} width={56} height={56} className="rounded-md flex-shrink-0" />
                    )}
                    <div className="truncate">
                        <p className="font-bold truncate">{activeTrack.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{activeTrack.artists.map(a => a.name).join(', ')}</p>
                    </div>
                </div>

                {/* Player Controls */}
                <div className="flex items-center gap-4">
                    <Button onClick={playPrevious} variant="ghost" size="icon" disabled={isTrackLoading}>
                        <SkipBackIcon className="h-5 w-5" />
                    </Button>
                    <Button 
                        variant="default" 
                        size="icon" 
                        className="rounded-full h-10 w-10" 
                        onClick={handlePlayPause}
                        disabled={isTrackLoading || !activeTrack.url}
                    >
                        {isTrackLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : isPlaying ? (
                            <PauseIcon className="h-5 w-5" />
                        ) : (
                            <PlayIcon className="h-5 w-5" />
                        )}
                    </Button>
                    <Button onClick={playNext} variant="ghost" size="icon" disabled={isTrackLoading}>
                        <SkipForwardIcon className="h-5 w-5" />
                    </Button>
                </div>

                {/* Volume Control */}
                <div className="hidden md:flex items-center gap-2 w-32">
                    <Button onClick={toggleMute} variant="ghost" size="icon">
                        {volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                    <Slider
                        value={[volume]}
                        onValueChange={handleVolumeChange}
                        max={1}
                        step={0.01}
                    />
                </div>

                {/* Close Button */}
                <Button onClick={hidePlayer} variant="ghost" size="icon">
                    <XIcon className="h-5 w-5" />
                </Button>
            </div>
        </footer>
    );
}