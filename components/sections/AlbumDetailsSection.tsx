'use client';

import { useUserStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import SongCard from "../elements/SongCard";
import Image from "next/image";

export default function AlbumDetailsSection() {
    const { selectedAlbumId, showHome } = useUserStore();
    const [tracks, setTracks] = useState([]);
    const [albumInfo, setAlbumInfo] = useState<any>(null);

    useEffect(() => {
        if (selectedAlbumId) {
            const fetchAlbumDetails = async () => {
                const [albumRes, tracksRes] = await Promise.all([
                    fetch(`/api/spotify/albums/${selectedAlbumId}`),
                    fetch(`/api/spotify/albums/${selectedAlbumId}/tracks`)
                ]);

                if (albumRes.ok && tracksRes.ok) {
                    const albumData = await albumRes.json();
                    const tracksData = await tracksRes.json();
                    
                    setAlbumInfo(albumData);

                    // Augment track objects with album info
                    const augmentedTracks = tracksData.items.map((track: any) => ({
                        ...track,
                        album: {
                            images: albumData.images,
                            name: albumData.name,
                        }
                    }));
                    setTracks(augmentedTracks);
                }
            };
            fetchAlbumDetails();
        }
    }, [selectedAlbumId]);

    return (
        <div>
            <Button onClick={showHome} variant="outline" className="mb-4">
                &larr; Back to Search
            </Button>
            
            {albumInfo && (
                <header className="flex items-center gap-8 mb-8">
                    <Image src={albumInfo.images[0].url} alt={albumInfo.name} width={150} height={150} className="rounded-md" />
                    <div>
                        <h1 className="text-4xl font-bold">{albumInfo.name}</h1>
                        <p className="text-xl text-muted-foreground">{albumInfo.artists.map((artist: any) => artist.name).join(', ')}</p>
                    </div>
                </header>
            )}

            <h2 className="text-2xl font-bold mb-4">Tracks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tracks.map((track: any) => (
                    <SongCard key={track.id} track={track} />
                ))}
            </div>
        </div>
    );
} 