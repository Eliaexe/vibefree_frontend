'use client';

import { useEffect } from "react";
import { useUserStore } from "@/lib/store";
import AlbumCard from "../elements/AlbumCard";

export default function AlbumSection() {
  const { savedAlbums, setSavedAlbums } = useUserStore();

  useEffect(() => {
    // Fetch only if albums are not already in the store
    if (savedAlbums.length === 0) {
      const fetchSavedAlbums = async () => {
        try {
          const response = await fetch('/api/spotify/saved-albums');
          if (response.ok) {
            const data = await response.json();
            setSavedAlbums(data.items);
          }
        } catch (error) {
          console.error('Failed to fetch saved albums', error);
        }
      };
      fetchSavedAlbums();
    }
  }, [savedAlbums.length, setSavedAlbums]);


  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">My Saved Albums</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {savedAlbums.map((item) => (
          <AlbumCard key={item.album.id} album={item.album} />
        ))}
      </div>
    </div>
  );
}