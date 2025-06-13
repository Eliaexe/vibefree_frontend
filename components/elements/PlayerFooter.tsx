'use client';

import { useUserStore, SpotifyTrack } from "@/lib/store";
import Image from "next/image";
import { Button } from "../ui/button";
import { XIcon, PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, Volume2, VolumeX, Music2Icon } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import LoadingLogo from "./LoadingLogo";

const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

export default function PlayerFooter() {
    const { 
        isPlayerVisible, 
        activeTrack, 
        isTrackLoading,
        playQueue,
        currentTrackIndex,
        trackProgress,
        hidePlayer, 
        playNext, 
        playPrevious,
        playTracks,
        setTrackProgress,
    } = useUserStore();
    
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [lastVolume, setLastVolume] = useState(0.5);

    const handlePlayPause = useCallback(() => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    }, [isPlaying]);

    // Effect for Media Session API
    useEffect(() => {
        if ('mediaSession' in navigator && activeTrack) {
            const setupMediaSession = () => {
                const mediaMetadata = {
                    title: activeTrack.name,
                    artist: activeTrack.artists.map(a => a.name).join(', '),
                    album: activeTrack.album?.name || '',
                    artwork: activeTrack.album?.images?.map(image => ({
                        src: image.url,
                        sizes: `${image.width}x${image.height}`,
                        type: 'image/jpeg'
                    })) || []
                };
                
                navigator.mediaSession.metadata = new MediaMetadata(mediaMetadata);

                navigator.mediaSession.setActionHandler('play', () => {
                    if (audioRef.current) {
                        audioRef.current.play();
                    }
                });
                navigator.mediaSession.setActionHandler('pause', () => {
                    if (audioRef.current) {
                        audioRef.current.pause();
                    }
                });
                navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
                navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
                
                // Imposta lo stato iniziale
                navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
            };

            // Aspetta che l'audio sia caricato prima di impostare la Media Session
            if (audioRef.current) {
                if (audioRef.current.readyState >= 2) {
                    // Audio già caricato
                    setupMediaSession();
                } else {
                    // Aspetta che l'audio sia caricato
                    const handleLoadedMetadata = () => {
                        setupMediaSession();
                        audioRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
                    };
                    audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
                    
                    return () => {
                        audioRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
                    };
                }
            }
        }
    }, [activeTrack, playNext, playPrevious, isPlaying]);

    // Effect to keep playback state in sync with the Media Session API
    useEffect(() => {
        if ('mediaSession' in navigator && activeTrack) {
            navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
        }
    }, [isPlaying, activeTrack]);

    const handleTimeUpdate = useCallback(() => {
        if (audioRef.current) {
            setTrackProgress({
                currentTime: audioRef.current.currentTime,
                duration: audioRef.current.duration || 0,
            });
        }
    }, [setTrackProgress]);
    
    const handleProgressChange = (value: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value[0];
        }
    };
    
    useEffect(() => {
        if (activeTrack?.url && audioRef.current) {
            audioRef.current.src = activeTrack.url;
            audioRef.current.volume = volume;
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(e => console.error("Error playing audio:", e));
        }
    }, [activeTrack?.id, activeTrack?.url]);

    if (!isPlayerVisible || !activeTrack) {
        return null;
    }

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
    
    const onTrackClick = (trackIndex: number) => {
        playTracks(playQueue, trackIndex);
    };

    const imageUrl = activeTrack.album?.images?.[0]?.url;

    const MiniPlayerContent = (
         <div className="container mx-auto flex items-center justify-between gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
                {imageUrl && (
                    <Image src={imageUrl} alt={activeTrack.album.name} width={56} height={56} className="rounded-md flex-shrink-0" />
                )}
                <div className="truncate">
                    <p className="font-bold truncate">{activeTrack.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{activeTrack.artists.map(a => a.name).join(', ')}</p>
                </div>
            </div>

            {/* Player Controls for Mobile and Desktop */}
            <div className="flex items-center gap-1">
                <Button onClick={(e) => { e.stopPropagation(); playPrevious(); }} variant="ghost" size="icon" disabled={isTrackLoading}>
                    <SkipBackIcon className="h-5 w-5" />
                </Button>
                <Button 
                    variant="default" 
                    size="icon" 
                    className="rounded-full h-10 w-10" 
                    onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
                    disabled={isTrackLoading || !activeTrack.url}
                >
                    {isTrackLoading ? <LoadingLogo showText={false} /> : isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                </Button>
                <Button onClick={(e) => { e.stopPropagation(); playNext(); }} variant="ghost" size="icon" disabled={isTrackLoading}>
                    <SkipForwardIcon className="h-5 w-5" />
                </Button>
                <Button onClick={(e) => { e.stopPropagation(); hidePlayer(); }} variant="ghost" size="icon" className="ml-2">
                     <XIcon className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
    
    return (
        <footer className="fixed bottom-0 left-0 right-0 z-50">
            <audio 
                ref={audioRef}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={playNext}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
            />

            <Drawer>
                <DrawerTrigger asChild>
                    <div className="bg-background border-t p-2 cursor-pointer">
                        <div className="container mx-auto">
                            {/* Progress Bar for Mini Player */}
                            <Slider
                                value={[trackProgress.currentTime]}
                                max={trackProgress.duration || 1}
                                onValueChange={handleProgressChange}
                                className="h-1 absolute top-[-4px] left-0 right-0 w-full p-0 group"
                            />
                        </div>
                        {MiniPlayerContent}
                    </div>
                </DrawerTrigger>

                <DrawerContent className="h-full max-h-screen bg-background text-foreground flex flex-col">
                    {/* Drag Handle */}
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-4" />
                    
                    <div className="container mx-auto p-4 flex-1 overflow-y-auto">
                        {/* Large Album Art & Details */}
                        <div className="flex flex-col items-center gap-4 text-center">
                            {imageUrl ? (
                                <Image src={imageUrl} alt={activeTrack.album.name} width={200} height={200} className="rounded-lg shadow-2xl w-full max-w-xs aspect-square" />
                            ) : (
                                <div className="w-full max-w-xs aspect-square bg-muted rounded-lg shadow-2xl flex items-center justify-center">
                                    <Music2Icon className="h-24 w-24 text-muted-foreground" />
                                </div>
                            )}
                             <div className="mt-4">
                                <h2 className="text-2xl font-bold">{activeTrack.name}</h2>
                                <p className="text-lg text-muted-foreground">{activeTrack.artists.map(a => a.name).join(', ')}</p>
                            </div>
                        </div>

                        {/* Progress Bar for Expanded Player */}
                        <div className="w-full px-4 sm:px-8 space-y-2 my-4">
                            <Slider
                                value={[trackProgress.currentTime]}
                                max={trackProgress.duration || 1}
                                onValueChange={handleProgressChange}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{formatDuration(trackProgress.currentTime)}</span>
                                <span>{formatDuration(trackProgress.duration)}</span>
                            </div>
                        </div>

                        {/* Full Player Controls */}
                        <div className="flex items-center justify-center gap-4 my-4">
                            <Button onClick={playPrevious} variant="ghost" size="icon" disabled={isTrackLoading}>
                                <SkipBackIcon className="h-8 w-8" />
                            </Button>
                            <Button 
                                variant="default" 
                                size="icon" 
                                className="rounded-full h-16 w-16" 
                                onClick={handlePlayPause}
                                disabled={isTrackLoading || !activeTrack.url}
                            >
                                {isTrackLoading ? <LoadingLogo showText={false} /> : isPlaying ? <PauseIcon className="h-8 w-8" /> : <PlayIcon className="h-8 w-8" />}
                            </Button>
                            <Button onClick={playNext} variant="ghost" size="icon" disabled={isTrackLoading}>
                                <SkipForwardIcon className="h-8 w-8" />
                            </Button>
                        </div>

                        {/* Volume Control for Expanded Player */}
                        <div className="w-full max-w-xs mx-auto flex items-center gap-2">
                            <Button onClick={toggleMute} variant="ghost" size="icon">
                                {volume === 0 ? <VolumeX className="h-5 w-5 text-muted-foreground" /> : <Volume2 className="h-5 w-5 text-muted-foreground" />}
                            </Button>
                            <Slider
                                value={[volume]}
                                onValueChange={handleVolumeChange}
                                max={1}
                                step={0.01}
                            />
                        </div>
                        
                        {/* Play Queue */}
                        <div className="mt-8">
                            <h3 className="text-lg font-bold mb-2 px-4">Up next</h3>
                             {playQueue.slice((currentTrackIndex ?? 0) + 1).map((track, index) => (
                                <div 
                                    key={track.id + index}
                                    onClick={() => onTrackClick((currentTrackIndex ?? -1) + 1 + index)}
                                    className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                                >
                                    {track.album.images?.[0]?.url && (
                                        <Image src={track.album.images[0].url} alt={track.album.name} width={40} height={40} className="rounded" />
                                    )}
                                    <div className="truncate">
                                        <p className="font-semibold truncate">{track.name}</p>
                                        <p className="text-sm text-muted-foreground truncate">{track.artists.map(a => a.name).join(', ')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </footer>
    );
}