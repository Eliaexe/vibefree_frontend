'use client';

import { useUserStore } from "@/lib/store";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { ArrowLeftIcon, PlayIcon, Music2Icon } from "lucide-react";
import LoadingLogo from "../elements/LoadingLogo";

// Define more specific types
interface AlbumDetails {
    name: string;
    artists: { id: string, name: string }[];
    images: { url: string }[];
    release_date: string;
    total_tracks: number;
}
type Track = ReturnType<typeof useUserStore.getState>['topTracks'][0];


export default function AlbumDetailsSection() {
    const { selectedAlbumId, showHome, playTracks, showArtistDetails } = useUserStore();
    const [albumDetails, setAlbumDetails] = useState<AlbumDetails | null>(null);
    const [albumTracks, setAlbumTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!selectedAlbumId) return;

        const fetchAlbumData = async () => {
            setLoading(true);
            try {
                // Fetch details and tracks in parallel
                const [detailsRes, tracksRes] = await Promise.all([
                    fetch(`/api/spotify/albums/${selectedAlbumId}`),
                    fetch(`/api/spotify/albums/${selectedAlbumId}/tracks`)
                ]);

                if (!detailsRes.ok || !tracksRes.ok) {
                    throw new Error('Failed to fetch album data');
                }

                const details = await detailsRes.json();
                const tracksData = await tracksRes.json();

                const enrichedTracks = tracksData.items.map((track: any) => ({
                    ...track,
                    album: {
                        id: details.id,
                        name: details.name,
                        images: details.images
                    }
                }));

                setAlbumDetails(details);
                setAlbumTracks(enrichedTracks);

            } catch (error)
            {
                console.error("Error fetching album details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlbumData();
    }, [selectedAlbumId]);

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
    };

    if (loading) {
        return <LoadingLogo />;
    }

    if (!albumDetails) {
        return <p>Album not found.</p>;
    }

    const imageUrl = albumDetails.images?.[0]?.url;

    return (
        <div className="space-y-6">
             <Button onClick={showHome} variant="ghost" className="mb-4">
                <ArrowLeftIcon className="h-4 w-4 mr-2"/>
                Back
            </Button>
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                {imageUrl && (
                    <Image 
                        src={imageUrl} 
                        alt={albumDetails.name} 
                        width={200} 
                        height={200} 
                        className="w-32 h-32 sm:w-48 sm:h-48 object-cover rounded-lg shadow-lg flex-shrink-0"
                    />
                )}
                <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm font-bold uppercase">Album</p>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter">{albumDetails.name}</h1>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-sm text-muted-foreground">
                        <span 
                            className="font-bold hover:underline cursor-pointer" 
                            onClick={() => showArtistDetails(albumDetails.artists[0].id)}
                        >
                                {albumDetails.artists.map(a => a.name).join(', ')}
                        </span>
                        <span>•</span>
                        <span>{new Date(albumDetails.release_date).getFullYear()}</span>
                        <span>•</span>
                        <span>{albumDetails.total_tracks} songs</span>
                    </div>
                </div>
            </div>

            {/* Track List */}
            <div className="space-y-1">
                {albumTracks.map((track, index) => (
                    <div 
                        key={track.id} 
                        onClick={() => playTracks(albumTracks, index)}
                        className="group flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-muted-foreground w-6 text-right">{index + 1}</span>
                            <div>
                                <p className="font-semibold text-foreground group-hover:text-primary">{track.name}</p>
                                <p className="text-sm text-muted-foreground">{track.artists.map(a => a.name).join(', ')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">{formatDuration(track.duration_ms)}</span>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                <PlayIcon className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 