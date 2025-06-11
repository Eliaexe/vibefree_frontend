'use client';

import { useUserStore } from '@/lib/store';
import { useEffect, useState } from 'react';

// This component will be responsible for fetching user data on initial load
// and keeping the user state in sync.
export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let response = await fetch('/api/spotify/me');

        if (response.status === 401) {
          // Token might be expired, try to refresh it
          const refreshResponse = await fetch('/api/spotify/refresh', { method: 'POST' });
          if (refreshResponse.ok) {
            // Retry fetching user data
            response = await fetch('/api/spotify/me');
          } else {
            // Refresh failed, user is not logged in
            setUser(null);
            setIsLoading(false);
            return;
          }
        }

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [setUser]);

  // Optionally, you can show a loader while the session is being checked
  if (isLoading) {
    return <div>Loading session...</div>;
  }

  return <>{children}</>;
} 