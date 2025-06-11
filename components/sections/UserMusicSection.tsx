'use client';

import { useEffect } from "react";
import { useUserStore } from "@/lib/store";
import SongCard from "../elements/SongCard";

export default function UserMusicSection() {
  const { topTracks, setTopTracks } = useUserStore();

  useEffect(() => {
    // Fetch only if tracks are not already in the store
    if (topTracks.length === 0) {
      const fetchTopTracks = async () => {
        try {
          const response = await fetch('/api/spotify/top-tracks');
          if (response.ok) {
            const data = await response.json();
            setTopTracks(data.items);
          }
        } catch (error) {
          console.error('Failed to fetch top tracks', error);
        }
      };
      fetchTopTracks();
    }
  }, [topTracks.length, setTopTracks]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
      {topTracks.map((track) => (
        <SongCard key={track.id} track={track} />
      ))}
    </div>
  );
}