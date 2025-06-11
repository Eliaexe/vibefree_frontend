'use client';

import { Button } from "@/components/ui/button";
import { useUserStore } from '@/lib/store';

export default function LoginSection() {
  const { user, isLoggedIn, logout } = useUserStore();

  const loginWithSpotify = () => {
    window.location.href = '/api/spotify/login';
  };

  const handleLogout = async () => {
    await fetch('/api/spotify/logout', { method: 'POST' });
    logout(); // This updates the client state
  };

  if (!isLoggedIn) {
    return (
      <div>
        <Button className="mt-4 rounded-full bg-green-500 text-white" onClick={loginWithSpotify}>Login with Spotify</Button>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {user?.display_name}</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}