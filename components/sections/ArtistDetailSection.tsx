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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {topTracks.map((track: any) => (
                        <SongCard key={track.id} track={track} />
                    ))}
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Albums & Singles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {albums.map((album: any) => (
                        <AlbumCard key={album.id} album={album} />
                    ))}
                </div>
            </section>
        </div>
    );
} 