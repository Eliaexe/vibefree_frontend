'use client';

import { Input } from "@/components/ui/input";
import { useUserStore } from "@/lib/store";
import SongCard from "../elements/SongCard";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import AlbumCard from "../elements/AlbumCard";
import ArtistCard from "../elements/ArtistCard";
import LoadingLogo from "../elements/LoadingLogo";

// Define a more specific type for search results
interface SearchResults {
    tracks: { items: any[] };
    albums: { items: any[] };
    artists: { items: any[] };
}

export default function SearchSection() {
    const { searchTerm, setSearchTerm, playTracks } = useUserStore();
    const [results, setResults] = useState<SearchResults | null>(null);
    const [loading, setLoading] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        if (debouncedSearchTerm) {
            setLoading(true);
            const fetchResults = async () => {
                const response = await fetch(`/api/spotify/search?q=${debouncedSearchTerm}`);
                const data = await response.json();

                // Simple reordering logic based on search term
                const reorderedData = { ...data };
                const lowerCaseSearch = debouncedSearchTerm.toLowerCase();

                // If an artist name is an exact match, move it to the front.
                const exactArtistMatchIndex = data.artists.items.findIndex(
                    (artist: any) => artist.name.toLowerCase() === lowerCaseSearch
                );
                if (exactArtistMatchIndex > 0) {
                    const [exactMatch] = reorderedData.artists.items.splice(exactArtistMatchIndex, 1);
                    reorderedData.artists.items.unshift(exactMatch);
                }
                
                setResults(reorderedData);
                setLoading(false);
            };
            fetchResults();
        } else {
            setResults(null);
        }
    }, [debouncedSearchTerm]);

    return (
        <div className="space-y-8">
            <Input 
                placeholder="Search for songs, albums, or artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {loading && <LoadingLogo />}

            {results && !loading && (
                <div className="space-y-8">
                    {results.tracks.items.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">Songs</h2>
                            <div className="flex space-x-4 overflow-x-auto pb-4">
                                {results.tracks.items.map((track, index) => (
                                    <div key={track.id} className="w-48 flex-shrink-0" onClick={() => playTracks(results.tracks.items, index)}>
                                        <SongCard track={track} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {results.artists.items.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">Artists</h2>
                            <div className="flex space-x-4 overflow-x-auto pb-4">
                                {results.artists.items.map((artist: any) => (
                                    <div key={artist.id} className="w-48 flex-shrink-0">
                                        <ArtistCard artist={artist} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {results.albums.items.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">Albums</h2>
                            <div className="flex space-x-4 overflow-x-auto pb-4">
                                {results.albums.items.map((album: any) => (
                                     <div key={album.id} className="w-48 flex-shrink-0">
                                        <AlbumCard album={album} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}