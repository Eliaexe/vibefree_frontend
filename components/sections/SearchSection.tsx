'use client';

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import SongCard from "../elements/SongCard";
import AlbumCard from "../elements/AlbumCard";
import ArtistCard from "../elements/ArtistCard";

// A custom hook for debouncing
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function SearchSection() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const debouncedQuery = useDebounce(query, 500); // 500ms delay

  useEffect(() => {
    if (debouncedQuery) {
      const searchItems = async () => {
        const response = await fetch(`/api/spotify/search?q=${debouncedQuery}`);
        const data = await response.json();
        setResults(data);
      };
      searchItems();
    } else {
      setResults(null);
    }
  }, [debouncedQuery]);

  const renderOrder = useMemo(() => {
    if (!results) return [];
    
    const defaultOrder = ['tracks', 'artists', 'albums'];
    const lowerCaseQuery = debouncedQuery.toLowerCase().trim();

    const topArtist = results.artists?.items[0]?.name.toLowerCase().trim();
    if (topArtist === lowerCaseQuery) {
        return ['artists', 'tracks', 'albums'];
    }

    const topTrack = results.tracks?.items[0]?.name.toLowerCase().trim();
    if (topTrack === lowerCaseQuery) {
        return ['tracks', 'artists', 'albums'];
    }

    return defaultOrder;

  }, [results, debouncedQuery]);


  const resultSections = {
    tracks: results?.tracks?.items?.length > 0 && (
        <section key="tracks" className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Songs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.tracks.items.map((track: any) => <SongCard key={track.id} track={track} />)}
            </div>
        </section>
    ),
    albums: results?.albums?.items?.length > 0 && (
        <section key="albums" className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Albums</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {results.albums.items.map((album: any) => <AlbumCard key={album.id} album={album} />)}
            </div>
        </section>
    ),
    artists: results?.artists?.items?.length > 0 && (
        <section key="artists" className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Artists</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {results.artists.items.map((artist: any) => <ArtistCard key={artist.id} artist={artist} />)}
            </div>
        </section>
    )
  };

  return (
    <div className="mt-8">
      <Input 
        type="text" 
        placeholder="Search for artists, songs, or albums"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {results && (
        <div className="mt-8">
            {renderOrder.map(section => resultSections[section as keyof typeof resultSections])}
        </div>
      )}
    </div>
  );
}