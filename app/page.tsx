'use client';

import LoginSection from "@/components/sections/LoginSection";
import UserMusicSection from "@/components/sections/UserMusicSection";
import { useUserStore } from "@/lib/store";
import AlbumSection from "@/components/sections/AlbumSection";
import SearchSection from "@/components/sections/SearchSection";
import AlbumDetailsSection from "@/components/sections/AlbumDetailsSection";
import ArtistDetailSection from "@/components/sections/ArtistDetailSection";
import PlayerFooter from "@/components/elements/PlayerFooter";
function AppContent() {
    const { currentView, searchTerm } = useUserStore();

    switch (currentView) {
        case 'albumDetails':
            return <AlbumDetailsSection />;
        case 'artistDetails':
            return <ArtistDetailSection />;
        case 'home':
        default:
            return (
                <>
                    <SearchSection />
                    {searchTerm ? null : <UserMusicSection />}
                </>
            );
    }
}


export default function Home() {
  const { isLoggedIn, user } = useUserStore();

  return (
    <div className="relative min-h-screen pb-28">
      <header className="flex justify-between items-center p-4 container mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold">VibeFree</h1>
        {isLoggedIn && user && (
            <div>
                <p>Hello, {user.display_name}</p>
            </div>
        )}
      </header>

      <main className="container mx-auto p-4">
        {!isLoggedIn ? (
            <LoginSection />
        ) : (
            <AppContent />
        )}
      </main>
      
      <PlayerFooter />
    </div>
  );
}
