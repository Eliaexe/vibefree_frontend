'use client';

import { useUserStore } from "@/lib/store";
import { useEffect, useState } from "react";
import Image from "next/image";
import SongCard from "../elements/SongCard";
import { Button } from "../ui/button";
import { ArrowLeftIcon } from "lucide-react";

// Define more specific types
interface AlbumDetails {
    name: string;
    artists: { name: string }[];
    images: { url: string }[];
    release_date: string;
}
type Track = ReturnType<typeof useUserStore.getState>['topTracks'][0];


export default function AlbumDetailsSection() {
    const { selectedAlbumId, showHome, playTracks } = useUserStore();
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

                // The tracks from this endpoint are simplified and don't contain album info.
                // We need to enrich them with the album details we just fetched.
                const enrichedTracks = tracksData.items.map((track: any) => ({
                    ...track,
                    album: {
                        name: details.name,
                        images: details.images
                    }
                }));

                setAlbumDetails(details);
                setAlbumTracks(enrichedTracks);

            } catch (error) {
                console.error("Error fetching album details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlbumData();
    }, [selectedAlbumId]);

    if (loading) {
        return <p>Loading album details...</p>;
    }

    if (!albumDetails) {
        return <p>Album not found.</p>;
    }

    const imageUrl = albumDetails.images?.[0]?.url;

    return (
        <div className="space-y-6">
             <Button onClick={showHome} variant="ghost" className="mb-4">
                <ArrowLeftIcon className="h-4 w-4 mr-2"/>
                Back to search
            </Button>
            <div className="flex flex-col md:flex-row items-start gap-8">
                {imageUrl && (
                    <Image src={imageUrl} alt={albumDetails.name} width={250} height={250} className="rounded-lg shadow-lg" />
                )}
                <div className="flex-1">
                    <h1 className="text-4xl font-extrabold tracking-tight">{albumDetails.name}</h1>
                    <p className="text-xl text-muted-foreground mt-2">{albumDetails.artists.map(a => a.name).join(', ')}</p>
                    <p className="text-sm text-muted-foreground mt-1">Released: {new Date(albumDetails.release_date).getFullYear()}</p>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Tracks</h2>
                <div className="space-y-2">
                    {albumTracks.map((track, index) => (
                       <div key={track.id} onClick={() => playTracks(albumTracks, index)}>
                         <SongCard track={track} />
                       </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 