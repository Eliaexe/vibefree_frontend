'use client';

import { useEffect } from "react";
import { useUserStore } from "@/lib/store";
import SongCard from "../elements/SongCard";
import AlbumCard from "../elements/AlbumCard";
import { SavedAlbum } from "@/lib/store";

export default function UserMusicSection() {
  const { topTracks, setTopTracks, savedAlbums, setSavedAlbums, playTracks } = useUserStore();

  useEffect(() => {
    const fetchMusic = async () => {
      if (topTracks.length === 0) {
        const resTracks = await fetch('/api/spotify/me/top-tracks');
        const dataTracks = await resTracks.json();
        setTopTracks(dataTracks.items || []);
      }
      if (savedAlbums.length === 0) {
        const resAlbums = await fetch('/api/spotify/me/saved-albums');
        const dataAlbums = await resAlbums.json();
        setSavedAlbums(dataAlbums.items || []);
      }
    };
    fetchMusic();
  }, [setTopTracks, topTracks.length, setSavedAlbums, savedAlbums.length]);

  return (
    <div className="space-y-8">
      {/* Top Tracks Section */}
      {topTracks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Top Tracks</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {topTracks.map((track, index) => (
              <div key={track.id} className="w-40 flex-shrink-0" onClick={() => playTracks(topTracks, index)}>
                <SongCard track={track} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved Albums Section */}
      {savedAlbums.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Saved Albums</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {savedAlbums.map((item: SavedAlbum) => (
               <div key={item.album.id} className="w-40 flex-shrink-0">
                  <AlbumCard album={item.album} />
               </div>
            ))}
          </div>
        </div>
      )}

      {topTracks.length === 0 && savedAlbums.length === 0 && <p>Loading your music...</p>}
    </div>
  );
}