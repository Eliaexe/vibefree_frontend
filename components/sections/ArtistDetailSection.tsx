'use client';

import { useUserStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import SongCard from "../elements/SongCard";
import AlbumCard from "../elements/AlbumCard";

export default function ArtistDetailSection() {
    const { selectedArtistId, showHome } = useUserStore();
    const [topTracks, setTopTracks] = useState([]);
    const [albums, setAlbums] = useState([]);

    useEffect(() => {
        if (selectedArtistId) {
            const fetchArtistDetails = async () => {
                const [tracksRes, albumsRes] = await Promise.all([
                    fetch(`/api/spotify/artists/${selectedArtistId}/top-tracks`),
                    fetch(`/api/spotify/artists/${selectedArtistId}/albums`)
                ]);

                if (tracksRes.ok) {
                    const tracksData = await tracksRes.json();
                    setTopTracks(tracksData.tracks);
                }
                if (albumsRes.ok) {
                    const albumsData = await albumsRes.json();
                    setAlbums(albumsData.items);
                }
            };
            fetchArtistDetails();
        }
    }, [selectedArtistId]);

    return (
        <div>
            <Button onClick={showHome} variant="outline" className="mb-4">
                &larr; Back to Search
            </Button>
            
            <section>
                <h2 className="text-2xl font-bold mb-4">Top Tracks</h2>
                <div className="flex space-x-4 overflow-x-auto pb-4">
                    {topTracks.map((track: any) => (
                        <div key={track.id} className="w-48 flex-shrink-0">
                            <SongCard track={track} />
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Albums & Singles</h2>
                <div className="flex space-x-4 overflow-x-auto pb-4">
                    {albums.map((album: any) => (
                        <div key={album.id} className="w-48 flex-shrink-0">
                            <AlbumCard album={album} />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
} 