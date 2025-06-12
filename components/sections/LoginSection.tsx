'use client';

import { Button } from "@/components/ui/button";
import { useUserStore } from '@/lib/store';
import { LogOut, Music2 } from 'lucide-react';

export default function LoginSection() {
  const { user, isLoggedIn, logout } = useUserStore();

  const loginWithSpotify = () => {
    window.location.href = '/api/spotify/login';
  };

  const handleLogout = async () => {
    await fetch('/api/spotify/logout', { method: 'POST' });
    logout(); // This updates the client state
  };

  // Wrapper div that centers the content both horizontally and vertically
  return (
    <div className="flex items-center justify-center min-h-[80vh] w-full p-4">
      {!isLoggedIn ? (
        <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-card border border-border shadow-sm max-w-md w-full">
          <div className="mb-6 p-4 rounded-full bg-green-500/10 text-green-500">
            <Music2 size={40} />
          </div>
          <h2 className="text-xl font-semibold mb-2">Benvenuto su VibeFree</h2>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Accedi con il tuo account Spotify per iniziare ad ascoltare musica senza limiti
          </p>
          <Button 
            size="lg"
            className="rounded-full bg-green-500 hover:bg-green-600 text-white font-medium px-8"
            onClick={loginWithSpotify}
          >
            Login con Spotify
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-card border border-border shadow-sm max-w-md w-full">
          <div className="w-full flex items-center justify-between mb-4">
            <div>
              <h2 className="font-medium">Ciao, {user?.display_name}</h2>
              <p className="text-sm text-muted-foreground">Bentornato su VibeFree</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}