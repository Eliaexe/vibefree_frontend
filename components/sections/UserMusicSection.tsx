'use client';

import { useEffect } from "react";
import { useUserStore } from "@/lib/store";
import SongCard from "../elements/SongCard";
import AlbumCard from "../elements/AlbumCard";
import { SavedAlbum } from "@/lib/store";

export default function UserMusicSection() {
  const { 
    topTracks, setTopTracks, 
    savedAlbums, setSavedAlbums, 
    savedTracks, setSavedTracks, 
    playTracks 
  } = useUserStore();

  useEffect(() => {
    const fetchMusic = async () => {
      if (topTracks.length === 0) {
        try {
          const resTracks = await fetch('/api/spotify/me/top-tracks');
          if (!resTracks.ok) throw new Error("Failed to fetch top tracks");
          const dataTracks = await resTracks.json();
          setTopTracks(dataTracks.items || []);
        } catch (error) {
          console.error(error);
        }
      }
      if (savedAlbums.length === 0) {
        try {
          const resAlbums = await fetch('/api/spotify/me/saved-albums');
          if (!resAlbums.ok) throw new Error("Failed to fetch saved albums");
          const dataAlbums = await resAlbums.json();
          setSavedAlbums(dataAlbums.items || []);
        } catch (error) {
            console.error(error);
        }
      }
      if (savedTracks.length === 0) {
        try {
            const resSaved = await fetch('/api/spotify/me/saved-tracks');
            if (!resSaved.ok) throw new Error("Failed to fetch saved tracks");
            const dataSaved = await resSaved.json();
            setSavedTracks(dataSaved.items || []);
        } catch (error) {
            console.error(error);
        }
      }
    };
    fetchMusic();
  }, [
    setTopTracks, topTracks.length, 
    setSavedAlbums, savedAlbums.length, 
    setSavedTracks, savedTracks.length
  ]);

  return (
    <div className="space-y-8 py-4">
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

      {/* Liked Songs Section */}
      {savedTracks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Liked Songs</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {savedTracks.map((track, index) => (
              <div key={track.id} className="w-40 flex-shrink-0" onClick={() => playTracks(savedTracks, index)}>
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

      {topTracks.length === 0 && savedAlbums.length === 0 && savedTracks.length === 0 && <p>Loading your music...</p>}
    </div>
  );
}