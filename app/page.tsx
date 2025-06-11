'use client';

import LoginSection from "@/components/sections/LoginSection";
import UserMusicSection from "@/components/sections/UserMusicSection";
import { useUserStore } from "@/lib/store";
import AlbumSection from "@/components/sections/AlbumSection";
import SearchSection from "@/components/sections/SearchSection";
import AlbumDetailsSection from "@/components/sections/AlbumDetailsSection";
import ArtistDetailSection from "@/components/sections/ArtistDetailSection";

function AppContent() {
    const { currentView } = useUserStore();

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
                    {/* <UserMusicSection /> */}
                    {/* <AlbumSection /> */}
                </>
            );
    }
}


export default function Home() {
  const { isLoggedIn, user } = useUserStore();

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">VibeFree</h1>
        {isLoggedIn && user && (
            <div>
                <p>Welcome, {user.display_name}</p>
            </div>
        )}
      </header>

      <main>
        {!isLoggedIn ? (
            <LoginSection />
        ) : (
            <AppContent />
        )}
      </main>
      
    </div>
  );
}
